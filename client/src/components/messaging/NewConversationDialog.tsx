import React, { useState, useEffect } from 'react';
import { useMessaging } from '@/context/messaging-context';
import { useAuth } from '@/context/auth-context';
import { useAllStaff } from '@/hooks/use-doctor';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, User, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { DoctorDetail } from '@/types';

// Define the conversation type
export type ConversationType = 'private' | 'group';

// Define the create conversation request interface
export interface CreateConversationRequest {
    type: ConversationType;
    name?: string; // Optional for private conversations, required for group
    participantIds: number[]; // Using number[] instead of int64[] as TypeScript doesn't have int64
}

interface Staff {
    id: number;
    doctor_id: number;
    doctor_name: string;
    username: string;
    full_name: string;
    data_image?: string;
    avatar?: string;
}

interface NewConversationDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({ isOpen, onClose }) => {
    const { createConversation } = useMessaging();
    const { doctor } = useAuth();
    const { data, isLoading } = useAllStaff();

    // Ensure staff is always an array
    const staff = Array.isArray(data) ? data : data?.data || [];

    const [activeTab, setActiveTab] = useState<string>('direct');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedStaff, setSelectedStaff] = useState<DoctorDetail[]>([]);
    const [groupName, setGroupName] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);

    // Reset state when dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedStaff([]);
            setGroupName('');
            setSearchTerm('');
            setActiveTab('direct');
        }
    }, [isOpen]);

    // Updated filter logic with proper type annotations
    const filteredStaff = React.useMemo(() => {
        if (!staff) return [];
        
        return staff
            .filter((s: Staff) => s && typeof s.doctor_id === 'number' && s.doctor_id !== Number(doctor?.id))
            .filter((s: Staff) => {
                if (!searchTerm) return true;
                const searchLower = searchTerm.toLowerCase();
                return (
                    (s.doctor_name || '').toLowerCase().includes(searchLower) ||
                    (s.username || '').toLowerCase().includes(searchLower)
                );
            });
    }, [staff, doctor?.id, searchTerm]);

    // Handle staff selection
    const toggleSelectStaff = (staffMember: DoctorDetail) => {
        if (activeTab === 'direct') {
            // In direct message mode, only allow selecting one staff member
            setSelectedStaff([staffMember]);
        } else {
            // In group mode, allow selecting multiple staff members
            const isSelected = selectedStaff.some(s => s.doctor_id === staffMember.doctor_id);
            if (isSelected) {
                setSelectedStaff(selectedStaff.filter(s => s.doctor_id !== staffMember.doctor_id));
            } else {
                setSelectedStaff([...selectedStaff, staffMember]);
            }
        }
    };

    // Check if staff is selected
    const isStaffSelected = (staffId: number): boolean => {
        return selectedStaff.some(s => s.doctor_id === staffId);
    };

    // Handle creating new conversation
    const handleCreateConversation = async () => {
        try {
            if (selectedStaff.length === 0) {
                toast({
                    title: "Error",
                    description: "Please select at least one person to chat with",
                    variant: "destructive",
                });
                return;
            }

            if (activeTab === 'group' && !groupName.trim()) {
                toast({
                    title: "Error",
                    description: "Please enter a group name",
                    variant: "destructive",
                });
                return;
            }

            setIsCreating(true);

            // Create conversation request based on the chat type
            const conversationRequest: CreateConversationRequest = {
                type: activeTab === 'direct' ? 'private' : 'group',
                participantIds: []
            };
            
            // For direct messages, only include the selected doctor's ID
            if (activeTab === 'direct') {
                conversationRequest.participantIds = [selectedStaff[0].doctor_id];
            } 
            // For group chats, include all selected doctors (current user is added by backend)
            else {
                conversationRequest.participantIds = selectedStaff.map(s => s.doctor_id);
                conversationRequest.name = groupName.trim();
            }

            await createConversation(conversationRequest);

            toast({
                title: "Success",
                description: activeTab === 'group'
                    ? "New group chat created"
                    : "New conversation created",
            });

            onClose();
        } catch (error) {
            console.error("Error creating conversation:", error);
            toast({
                title: "Error",
                description: "Could not create conversation. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">Create New Conversation</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Select people or create a group to start chatting
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="direct" className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Direct</span>
                        </TabsTrigger>
                        <TabsTrigger value="group" className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Group</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="direct">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-4 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="text-sm text-gray-500 mb-2">
                                {selectedStaff.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                        <span>Selected:</span>
                                        <Badge variant="secondary" className="font-normal">
                                            {selectedStaff[0].doctor_name}
                                        </Badge>
                                    </div>
                                ) : (
                                    <span>Select someone to start chatting</span>
                                )}
                            </div>

                            <ScrollArea className="h-[300px] overflow-y-auto rounded-md border border-gray-200">
                                <div className="p-2 space-y-1">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full p-4">
                                            <p className="text-gray-500 text-sm">Loading users...</p>
                                        </div>
                                    ) : filteredStaff.length > 0 ? (
                                        filteredStaff.map((s: DoctorDetail) => (
                                            <div
                                                key={s.doctor_id}
                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                                    isStaffSelected(s.doctor_id) 
                                                    ? 'bg-indigo-50 text-indigo-900' 
                                                    : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => toggleSelectStaff(s)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {(s.doctor_name || '')[0]?.toUpperCase()}
                                                        </AvatarFallback>
                                                        {s.data_image && (
                                                            <AvatarImage 
                                                                src={`data:image/png;base64,${s.data_image}`}
                                                                alt={s.doctor_name}
                                                            />
                                                        )}
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{s.doctor_name}</p>
                                                        <p className="text-xs text-gray-500">@{s.username}</p>
                                                    </div>
                                                </div>
                                                <Checkbox 
                                                    checked={isStaffSelected(s.doctor_id)}
                                                    className="border-gray-300"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-32">
                                            <p className="text-gray-500 text-sm">
                                                {searchTerm ? 'No users found' : 'No users available'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="group">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="group-name">Group Name</Label>
                                <Input
                                    id="group-name"
                                    placeholder="Enter group name..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label>Members</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground mb-2">
                                {selectedStaff.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span>Selected ({selectedStaff.length}):</span>
                                        {selectedStaff.map((s) => (
                                            <Badge key={s.doctor_id} variant="secondary" className="font-normal">
                                                {s.doctor_name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <span>Select at least one group member</span>
                                )}
                            </div>

                            <ScrollArea className="h-[200px] pr-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500 text-sm">Loading users...</p>
                                    </div>
                                ) : filteredStaff.length > 0 ? (
                                    filteredStaff.map((s: DoctorDetail) => (
                                        <div
                                            key={s.doctor_id}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer mb-1 ${isStaffSelected(s.doctor_id) ? 'bg-primary/10' : 'hover:bg-secondary/40'
                                                }`}
                                            onClick={() => toggleSelectStaff(s)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Avatar>
                                                    <AvatarFallback>{(s.doctor_name || '').charAt(0).toUpperCase()}</AvatarFallback>
                                                    <AvatarImage src={s.data_image} />
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{s.doctor_name}</p>
                                                    <p className="text-xs text-gray-500">@{s.username}</p>
                                                </div>
                                            </div>
                                            <Checkbox checked={isStaffSelected(s.doctor_id)} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500 text-sm">
                                            {searchTerm ? 'No users found' : 'No users available'}
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="sm:justify-between mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateConversation}
                        disabled={isCreating || selectedStaff.length === 0 || (activeTab === 'group' && !groupName.trim())}
                        className="ml-2 bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        {isCreating ? 'Creating...' : 'Create Conversation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewConversationDialog;