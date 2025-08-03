import axios from "axios";

//user api's
export const signupapi = async (email, password) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/user/signup`,
      {
        email: email,
        password: password,
      }
    );

    if (response?.data?.message === "User signed up successfully") {
      return {
        message: "Signup successful",
      };
    }
  } catch (e) {
    return {
      message: "Failed to Signup",
      error: e,
    };
  }
};

export const signinapi = async (email, password) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/user/signin`,
      {
        email: email,
        password: password,
      }
    );

    if (response?.data?.message === "User Signed in succesfully") {
      return {
        message: "Signin successful",
        token: response.data.token,
      };
    } else {
      return {
        message: "Failed to Signin",
      };
    }
  } catch (e) {
    return {
      message: "Failed to Signin",
      error: e,
    };
  }
};

//task api's

export const gettasksapi = async (token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/task`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response?.data?.message === "Fetched tasks successfully") {
      return {
        message: "Tasks fetched successfully",
        tasks: response.data.tasks,
      };
    }
  } catch (e) {
    return {
      message: "Failed to fetch tasks",
      error: e,
    };
  }
};

export const createtaskapi = async (token, body) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/task`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response?.data?.message === "Task created successfully") {
      return {
        message: "Task created successfully",
      };
    }
  } catch (e) {
    return {
      message: "Failed to create task",
      error: e,
    };
  }
};
export const updatetaskapi = async (token, id, body) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/api/task/${id}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response?.data?.status === 200) {
      return {
        message: "Task updated successfully",
      };
    }
  } catch (e) {
    return {
      message: "Failed to update task",
      error: e,
    };
  }
};

export const deletetaskapi = async (token, id) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/api/task/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response?.data?.status === 200) {
      return {
        message: "Task deleted successfully",
      };
    }
  } catch (e) {
    return {
      message: "Failed to delete task",
      error: e,
    };
  }
};
