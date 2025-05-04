import User from "@/models/User";

export const getUserById = async (id: string) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user ? user.toJSON() : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Error fetching user");
  }
};
