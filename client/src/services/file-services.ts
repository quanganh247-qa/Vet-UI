// authRoute.POST("upload", minioHandler.UploadFile)
// 		authRoute.GET("file/:file_id", minioHandler.GetFile)
// 		authRoute.GET("files", minioHandler.GetFiles)

import api from "@/lib/api";

export type FileResponse = {
  id: number;
  url: string;
  path: string;
};

export const uploadFile = async (
  file: File,
  pet_id: number
): Promise<FileResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pet_id", pet_id.toString());

    const response = await api.post("/api/v1/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFile = async (file_id: number): Promise<FileResponse> => {
  try {
    const response = await api.get(`/api/v1/file/${file_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFiles = async (pet_id: number): Promise<FileResponse[]> => {
  try {
    const response = await api.get("/api/v1/files?pet_id=" + pet_id);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};