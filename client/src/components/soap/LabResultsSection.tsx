import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'wouter';
import { 
  FileText, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Beaker
} from 'lucide-react';
import { useTestsByPetID } from '@/hooks/use-test';
import type { Test } from '@/services/test-services';

interface LabResultsSectionProps {
  appointmentId: string;
  petId: string;
}

const LabResultsSection: React.FC<LabResultsSectionProps> = ({
  appointmentId,
  petId
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Sử dụng hook từ use-test để lấy dữ liệu xét nghiệm
  const { data: labTests, isLoading, refetch: refetchTests } = useTestsByPetID(petId);
  
  // Nhóm xét nghiệm theo trạng thái
  const pendingTests = labTests?.filter((test: Test) => 
    test.status === 'Pending' || test.status === 'In-Progress'
  ) || [];
  
  const completedTests = labTests?.filter((test: Test) => 
    test.status === 'Completed' || test.status === 'Reviewed'
  ) || [];
  
  const handleViewResults = () => {
    navigate(`/appointment/${appointmentId}/lab-review`);
  };
  
  const handleRefresh = () => {
    refetchTests();
    toast({
      title: "Đã cập nhật",
      description: "Danh sách xét nghiệm đã được cập nhật",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };
  
  const handleOrderTest = () => {
    navigate(`/appointment/${appointmentId}/lab-management`);
  };
  
  const getCategoryLabel = (testType: string) => {
    const types: Record<string, string> = {
      'blood': 'Xét nghiệm máu',
      'stool': 'Xét nghiệm phân',
      'urine': 'Xét nghiệm nước tiểu',
      'imaging': 'Siêu âm/X-ray',
      'quicktest': 'Test nhanh'
    };
    return types[testType] || testType;
  };
  
  const getStatusBadge = (status: string) => {
    if (status === 'Pending') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" /> Đang chờ
        </Badge>
      );
    } else if (status === 'In-Progress') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <RefreshCw className="mr-1 h-3 w-3" /> Đang xử lý
        </Badge>
      );
    } else if (status === 'Completed') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Hoàn thành
        </Badge>
      );
    } else if (status === 'Reviewed') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Đã xem xét
        </Badge>
      );
    }
    return null;
  };
  
  // Kiểm tra nếu kết quả xét nghiệm có bất thường
  const getAbnormalBadge = (test: Test) => {
    if (!test.result) return null;
    
    // Trong thực tế, logic này sẽ phức tạp hơn,
    // dựa trên so sánh với giá trị tham chiếu hoặc flag từ backend
    const hasAbnormalResults = Object.values(test.result.parameters).some(
      value => typeof value === 'string' && value.includes('bất thường')
    );
    
    if (hasAbnormalResults) {
      return (
        <Badge className="bg-red-100 text-red-800 ml-2">
          <AlertCircle className="mr-1 h-3 w-3" /> Bất thường
        </Badge>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="ml-2 text-indigo-600">Đang tải xét nghiệm...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!labTests || labTests.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Beaker className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-gray-700 font-medium">Chưa có xét nghiệm nào</span>
            </div>
            <Button 
              size="sm" 
              onClick={handleOrderTest}
            >
              Tạo xét nghiệm
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Beaker className="h-5 w-5 mr-2 text-blue-600" />
            <CardTitle className="text-md">Xét nghiệm</CardTitle>
            {pendingTests.length > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                {pendingTests.length} đang chờ
              </Badge>
            )}
            {completedTests.length > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-800">
                {completedTests.length} hoàn thành
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {pendingTests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 text-yellow-700">Đang chờ kết quả</h3>
                <ul className="space-y-2">
                  {pendingTests.map((test: Test) => (
                    <li key={test.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded-md text-sm">
                      <div>
                        <span className="font-medium">{getCategoryLabel(test.testType)}</span>
                        <span className="text-gray-500 ml-2 text-xs">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {getStatusBadge(test.status)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {completedTests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 text-green-700">Kết quả đã có</h3>
                <ul className="space-y-2">
                  {completedTests.map((test: Test) => (
                    <li key={test.id} className="flex justify-between items-center p-2 bg-green-50 rounded-md text-sm">
                      <div>
                        <span className="font-medium">{getCategoryLabel(test.testType)}</span>
                        <span className="text-gray-500 ml-2 text-xs">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {getAbnormalBadge(test)}
                        {getStatusBadge(test.status)}
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs text-blue-700">
                        Đã có kết quả xét nghiệm. Bạn có thể tiếp tục quy trình chẩn đoán và điều trị.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleOrderTest}
              >
                <Beaker className="h-4 w-4 mr-1" /> Tạo xét nghiệm mới
              </Button>
              
              {completedTests.length > 0 && (
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-sm"
                    onClick={handleViewResults}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" /> Xem chi tiết kết quả
                  </Button>
                  
                  <Button 
                    size="sm" 
                    className="text-sm bg-green-600 hover:bg-green-700"
                    onClick={() => navigate(`/appointment/${appointmentId}/diagnosis`)}
                  >
                    <FileText className="h-4 w-4 mr-1" /> Tiếp tục chẩn đoán
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LabResultsSection; 