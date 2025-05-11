import { useMutation, useQuery } from "@tanstack/react-query";
import { getFile, getFiles, uploadFile } from "@/services/file-services";

export const useFile = (file_id: number) => {
  return useQuery({
    queryKey: ["file", file_id],
    queryFn: () => getFile(file_id),
  });
};

export const useFiles = (pet_id: number) => {
  return useQuery({
    queryKey: ["files", pet_id],
    queryFn: () => getFiles(pet_id),
  });
};

export const useUploadFile = () => {
    return useMutation({
      mutationFn: ({ file, pet_id }: { file: File; pet_id: number }) => uploadFile(file, pet_id),
    });
  };
  