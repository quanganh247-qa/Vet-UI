import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/context/notification-context";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Bell, CheckCircle, Info, AlertTriangle, XCircle, X, Search, RefreshCw, ArrowLeft, Link as LinkIcon } from "lucide-react";
import { requestNotificationPermission } from "@/context/notification-context";
import { Link } from "wouter";

const NotificationsAdmin = () => {
  const { 
    notifications, 
    unreadCount, 
    addNotification, 
    removeNotification, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
    hasAction: false,
    actionLabel: "View details"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [permissionStatus, setPermissionStatus] = useState(
    'Notification' in window ? Notification.permission : 'unavailable'
  );

  const handleNewNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const notification = {
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      ...(newNotification.hasAction && {
        action: {
          label: newNotification.actionLabel,
          onClick: () => console.log(`Action clicked for notification: ${newNotification.title}`)
        }
      })
    };
    
    addNotification(notification);
    
    // Reset form
    setNewNotification({
      title: "",
      message: "",
      type: "info",
      hasAction: false,
      actionLabel: "View details"
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      notification.title.toLowerCase().includes(searchTermLower) ||
      notification.message.toLowerCase().includes(searchTermLower)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRequestPermission = async () => {
    const permissionGranted = await requestNotificationPermission();
    setPermissionStatus(permissionGranted ? 'granted' : 'denied');
  };

  // Quick templates for common notifications
  const notificationTemplates = [
    {
      title: "Appointment Reminder",
      message: "You have an upcoming appointment in 30 minutes",
      type: "info" as const
    },
    {
      title: "Lab Results Ready",
      message: "New lab results have been received and are ready for review",
      type: "success" as const
    },
    {
      title: "Medication Alert",
      message: "Patient's medication needs to be administered at 5:00 PM today",
      type: "warning" as const
    }
  ];

  const applyTemplate = (template: any) => {
    setNewNotification(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type
    }));
  };

  // Related pages that might be useful in the notification workflow
  const relatedPages = [
    { name: "Dashboard", path: "/" },
    { name: "Appointments", path: "/appointments" },
    { name: "Patients List", path: "/patients" },
    { name: "Staff Management", path: "/staff" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
        </div>
      </div>

      {/* Quick access links to related pages */}
      <div className="flex flex-wrap gap-2">
        {relatedPages.map(page => (
          <Link key={page.path} href={page.path}>
            <Button variant="outline" size="sm" className="flex items-center">
              <LinkIcon className="h-3.5 w-3.5 mr-1" />
              {page.name}
            </Button>
          </Link>
        ))}
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Notification List</TabsTrigger>
          <TabsTrigger value="create">Create Notification</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Notification List */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notification List</CardTitle>
                  <CardDescription>Total: {notifications.length} | Unread: {unreadCount}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative max-w-xs w-44">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input 
                      type="search" 
                      placeholder="Search..." 
                      className="pl-10 pr-3 py-2 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline"
                      onClick={markAllAsRead}
                      className="text-xs h-10"
                    >
                      Mark all as read
                    </Button>
                  )}
                  <Button 
                    variant="destructive"
                    onClick={clearNotifications}
                    className="text-xs h-10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length > 0 ? (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 w-[100px]">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 w-[180px]">Type</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0">Title</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 hidden md:table-cell">Message</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 w-[180px]">Time</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 w-[120px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredNotifications.map((notification) => (
                          <tr 
                            key={notification.id} 
                            className={`border-b transition-colors hover:bg-muted/50 ${notification.read ? '' : 'bg-blue-50'}`}
                          >
                            <td className="p-4 align-middle">
                              {notification.read ? (
                                <Badge variant="outline" className="text-green-600 bg-green-50">Read</Badge>
                              ) : (
                                <Badge className="bg-blue-500">Unread</Badge>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center">
                                {getTypeIcon(notification.type)}
                                <span className="ml-2 capitalize">{notification.type}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle font-medium">
                              {notification.title}
                            </td>
                            <td className="p-4 align-middle hidden md:table-cell">
                              <div className="truncate max-w-xs">
                                {notification.message}
                              </div>
                            </td>
                            <td className="p-4 align-middle text-xs">
                              {formatDate(notification.timestamp)}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex space-x-1">
                                {!notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Read
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeNotification(notification.id)}
                                  className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    {searchTerm 
                      ? "No notifications match your search query." 
                      : "No notifications have been created yet. Create a new notification using the 'Create Notification' tab."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Notification */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Notification</CardTitle>
              <CardDescription>Create notifications to send to users</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Quick templates */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Quick Templates</h3>
                <div className="flex flex-wrap gap-2">
                  {notificationTemplates.map((template, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      className="text-xs"
                    >
                      {getTypeIcon(template.type)}
                      <span className="ml-1">{template.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleNewNotificationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter notification title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select 
                      value={newNotification.type}
                      onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Enter notification message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="hasAction"
                    checked={newNotification.hasAction}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, hasAction: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="hasAction" className="text-sm font-normal">Add action button</Label>
                </div>
                
                {newNotification.hasAction && (
                  <div className="pl-6 space-y-2">
                    <Label htmlFor="actionLabel">Button Label</Label>
                    <Input 
                      id="actionLabel" 
                      placeholder="Example: View details"
                      value={newNotification.actionLabel}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, actionLabel: e.target.value }))}
                      required={newNotification.hasAction}
                    />
                  </div>
                )}
                
                <div className="pt-4">
                  <Button type="submit" className="w-full md:w-auto">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Notification
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Desktop Notifications</h3>
                
                <div className="rounded-lg border p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Permission Status</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {permissionStatus === 'granted' 
                          ? 'Desktop notifications are allowed' 
                          : permissionStatus === 'denied' 
                            ? 'Desktop notifications have been denied'
                            : permissionStatus === 'unavailable'
                              ? 'Your browser does not support notifications'
                              : 'Notification permission has not been requested yet'}
                      </p>
                    </div>
                    
                    <Badge
                      className={`
                        ${permissionStatus === 'granted' ? 'bg-green-100 text-green-800' : ''}
                        ${permissionStatus === 'denied' ? 'bg-red-100 text-red-800' : ''}
                        ${permissionStatus === 'default' ? 'bg-gray-100 text-gray-800' : ''}
                        ${permissionStatus === 'unavailable' ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                    >
                      {permissionStatus === 'granted' ? 'Allowed' : 
                       permissionStatus === 'denied' ? 'Denied' : 
                       permissionStatus === 'unavailable' ? 'Not Supported' : 'Not Requested'}
                    </Badge>
                  </div>
                  
                  {permissionStatus !== 'granted' && permissionStatus !== 'unavailable' && (
                    <Button 
                      onClick={handleRequestPermission}
                      className="mt-4"
                      variant="outline"
                    >
                      Request Notification Permission
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Data</h3>
                
                <div className="rounded-lg border p-4 flex flex-col space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Notifications are stored on your device. You can delete all notifications to clean up data.</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Total notifications:</span>
                      <span className="ml-2">{notifications.length}</span>
                    </div>
                    
                    <Button 
                      variant="destructive"
                      onClick={clearNotifications}
                      size="sm"
                      className="text-xs"
                      disabled={notifications.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete All Notifications
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsAdmin; 