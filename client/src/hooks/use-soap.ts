import { useMutation, useQuery } from "@tanstack/react-query";
import { createSOAP, getSOAP, updateSOAP } from "@/services/soap-services";
import { ObjectiveData } from "@/types";

interface UpdateSOAPParams {
  appointmentID: string;
  subjective: string;
  objective: ObjectiveData;
  assessment: string;
  plan: number;
}

export const useCreateSOAP = () => {
    return useMutation({
      mutationFn: ({ appointmentID, subjective }: { appointmentID: string; subjective: string }) => createSOAP(appointmentID, subjective),
      onSuccess: (data) => {
        console.log("SOAP note created successfully:", data);
      },
      onError: (error) => {
        console.error("Error creating SOAP note:", error);
      },
    });
  };

export const useGetSOAP = (appointmentID: string) => {
    return useQuery({
        queryKey: ['soap', appointmentID],
        queryFn: () => getSOAP(appointmentID),
        enabled: !!appointmentID,
    });
};

export const useUpdateSOAP = () => {
  return useMutation({
    mutationFn: async (params: UpdateSOAPParams) => {
      if (!params.appointmentID) {
        throw new Error("appointmentID is required");
      }
      
      // Đảm bảo tất cả các giá trị đều là chuỗi và đúng định dạng
      const requestBody = {
        subjective: params.subjective || "",
        objective: {
          vital_signs: {
            weight: String(params.objective?.vital_signs?.weight || ''),
            temperature: String(params.objective?.vital_signs?.temperature || ''),
            heart_rate: String(params.objective?.vital_signs?.heart_rate || ''),
            respiratory_rate: String(params.objective?.vital_signs?.respiratory_rate || ''),
            general_notes: String(params.objective?.vital_signs?.general_notes || '')
          },
          systems: {
            cardiovascular: String(params.objective?.systems?.cardiovascular || ''),
            respiratory: String(params.objective?.systems?.respiratory || ''),
            gastrointestinal: String(params.objective?.systems?.gastrointestinal || ''),
            musculoskeletal: String(params.objective?.systems?.musculoskeletal || ''),
            neurological: String(params.objective?.systems?.neurological || ''),
            skin: String(params.objective?.systems?.skin || ''),
            eyes: String(params.objective?.systems?.eyes || ''),
            ears: String(params.objective?.systems?.ears || '')
          }
        },
        assessment: params.assessment || "",
        plan: typeof params.plan === "number" ? params.plan : 0
      };

      console.log("SOAP Update Request Body:", JSON.stringify(requestBody, null, 2));
      
      // Gọi service function với một requestBody hoàn chỉnh thay vì từng trường riêng lẻ
      return updateSOAP(params.appointmentID, requestBody);
    },
    onSuccess: (data) => {
      console.log('SOAP note updated successfully', data);
    },
    onError: (error) => {
      console.error('Error updating SOAP note:', error);
    }
  });
};

// export const useUpdateSOAP = () => {
//   return useMutation({
//     mutationFn: ({ 
//       appointmentID, 
//       subjective, 
//       objective, 
//       assessment, 
//       plan 
//     }: UpdateSOAPParams) =>
//       updateSOAP(appointmentID, subjective, objective, assessment, plan),
//     onSuccess: () => {
//       console.log('SOAP note updated successfully');
//     },
//     onError: (error) => {
//       console.error('Error updating SOAP note:', error);
//     }
//   });
// };