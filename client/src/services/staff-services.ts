import { DoctorDetail } from "@/types"

export const getAllStaff = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`api/v1/doctors`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    }
    catch (error) {
        console.error("Error fetching staff:", error);
        throw error;
    }
}