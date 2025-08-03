import { useEffect, useState } from "react";
import { Check, CheckSquare, Edit, Square, Trash2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  gettasksapi,
  createtaskapi,
  updatetaskapi,
  deletetaskapi,
} from "../apis/api.js";

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({ title: "", dueDate: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showLogout, setShowLogout] = useState(false);

  const navigate = useNavigate();

  const formatToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  const formatToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const getTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await gettasksapi(token);
      if (response.message === "Tasks fetched successfully") {
        setTasks(response.tasks);
        toast.success(response.message || "Tasks fetched successfully", {
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (e) {
      toast.error(e.message || "Failed to fetch tasks", {
        duration: 4000,
        position: "top-right",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        if (payload) {
          const decoded = JSON.parse(atob(payload));
          setUser(decoded);
        } else {
          console.warn("Invalid JWT format: payload missing");
        }
      } catch (e) {
        console.error("Failed to decode token:", e.message);
      }
    } else {
      console.warn("No token found in localStorage");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((task) => {
      if (filterStatus === "all") return true;
      return task.complete === (filterStatus === "complete");
    });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      toast.error("Title and due date are required", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        title: formData.title,
        dueDate: formatToDDMMYYYY(formData.dueDate),
        complete: false,
      };
      const response = await createtaskapi(token, body);
      toast.success(response.message || "Task created successfully", {
        duration: 4000,
        position: "top-right",
      });
      setFormData({ title: "", dueDate: "" });
      setCreateModalOpen(false);
      getTasks();
    } catch (e) {
      toast.error(e.message || "Failed to create task", {
        duration: 4000,
        position: "top-right",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = async (e, id) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      toast.error("Title and due date are required", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        title: formData.title,
        dueDate: formatToDDMMYYYY(formData.dueDate),
        complete: tasks.find((task) => task._id === id).complete,
      };
      const response = await updatetaskapi(token, id, body);
      toast.success(response.message || "Task updated successfully", {
        duration: 4000,
        position: "top-right",
      });
      setEditTask(null);
      setFormData({ title: "", dueDate: "" });
      getTasks();
    } catch (e) {
      toast.error(e.message || "Failed to update task", {
        duration: 4000,
        position: "top-right",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    setLoadingTaskId(task._id);
    try {
      const token = localStorage.getItem("token");
      const body = {
        title: task.title,
        dueDate: task.dueDate,
        complete: !task.complete,
      };
      const response = await updatetaskapi(token, task._id, body);
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === task._id ? { ...t, complete: !t.complete } : t
        )
      );
      toast.success(response.message || "Task status updated", {
        duration: 4000,
        position: "top-right",
      });
    } catch (e) {
      toast.error(e.message || "Failed to update task status", {
        duration: 4000,
        position: "top-right",
      });
      console.error(e);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleDeleteTask = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await deletetaskapi(token, deleteTaskId);
      toast.success(response.message || "Task deleted successfully", {
        duration: 4000,
        position: "top-right",
      });
      setDeleteModalOpen(false);
      setDeleteTaskId(null);
      getTasks();
    } catch (e) {
      toast.error(e.message || "Failed to delete task", {
        duration: 4000,
        position: "top-right",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (task) => {
    setEditTask(task._id);
    setFormData({ title: task.title, dueDate: formatToYYYYMMDD(task.dueDate) });
  };

  return (
    <div
      style={{ overflow: "hidden" }}
      className="relative min-h-screen min-w-screen h-screen w-screen bg-white p-4 sm:p-6 lg:p-8 overflow-hidden"
    >
      <Toaster />

      <span
        onClick={() => {
          setShowLogout(true);
        }}
        className="absolute top-2 right-2 text-blue-600 cursor-pointer"
      >
        Logout
      </span>

      <div
        style={{ overflow: "hidden" }}
        className="w-full h-[100%] flex flex-col items-center"
      >
        <p className="cursor-pointer mt-6 text-4xl my-4 text-gray-900 md:mb-4 flex items-center">
          <CheckSquare size={32} className="text-blue-600 mr-2" />
          Task Dashboard
        </p>
        <div className="w-full flex justify-center flex-col sm:flex-row gap-4 mb-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full sm:w-1/2 border border-gray-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <div className="flex gap-4">
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{ borderColor: "#C8D3F3", backgroundColor: "#ffffff" }}
              className="w-full sm:w-auto outline-none py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 ring-blue-500 text-blue-600"
            >
              Create Task
            </button>
          </div>
        </div>
        <div
          className="mb-3"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#C8D3F3",
            borderWidth: "2px",
            borderStyle: "solid",
            borderRadius: "8px",
            width: "300px",
            height: "36px",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0",
              left:
                filterStatus === "all"
                  ? "0"
                  : filterStatus === "incomplete"
                  ? "33.33%"
                  : "66.67%",
              width: "33.33%",
              height: "100%",
              backgroundColor:
                filterStatus === "all"
                  ? "rgba(0, 0, 255, 0.2)"
                  : filterStatus === "incomplete"
                  ? "rgba(128, 128, 128, 0.2)"
                  : "rgba(0, 128, 0, 0.2)",
              transition: "left 0.3s ease-in-out",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
              position: "relative",
            }}
          >
            <span
              style={{
                width: "33.33%",
                textAlign: "center",
                color: filterStatus === "all" ? "#0000FF" : "#000000",
                padding: "0 8px",
              }}
              onClick={() => setFilterStatus("all")}
            >
              All
            </span>
            <span
              style={{
                width: "33.33%",
                textAlign: "center",
                color: filterStatus === "incomplete" ? "#808080" : "#000000",
                padding: "0 8px",
              }}
              onClick={() => setFilterStatus("incomplete")}
            >
              Incomplete
            </span>
            <span
              style={{
                width: "33.33%",
                textAlign: "center",
                color: filterStatus === "complete" ? "#008000" : "#000000",
                padding: "0 8px",
              }}
              onClick={() => setFilterStatus("complete")}
            >
              Complete
            </span>
          </div>
        </div>
        <div className="w-full h-[80%] overflow-y-auto space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    style={{
                      backgroundColor: "transparent",
                      outline: "none",
                      border: "none",
                    }}
                    disabled={loadingTaskId === task._id}
                  >
                    {loadingTaskId === task._id ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : task.complete ? (
                      <CheckSquare className="h-5 w-5 text-green-500" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <p
                      className={`text-sm sm:text-base ${
                        task.complete
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Due: {task.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    style={{
                      backgroundColor: "transparent",
                      outline: "none",
                      border: "none",
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTaskId(task._id);
                      setDeleteModalOpen(true);
                    }}
                    style={{
                      backgroundColor: "transparent",
                      outline: "none",
                      border: "none",
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <span
              style={{ height: "100%" }}
              className="text-center text-gray-600 flex items-center justify-center"
            >
              No tasks found
            </span>
          )}
        </div>
      </div>

      {createModalOpen && (
        <div
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          className="fixed inset-0 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md z-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: "transparent", outline: "none" }}
                  className={`outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-blue-700 flex items-center justify-center ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Create"
                  )}
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: "transparent", outline: "none" }}
                  onClick={() => {
                    setCreateModalOpen(false);
                    setFormData({ title: "", dueDate: "" });
                  }}
                  className="outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTask && (
        <div
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          className="fixed inset-0 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md z-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Task
            </h2>
            <form
              onSubmit={(e) => handleEditTask(e, editTask)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: "transparent", outline: "none" }}
                  className={`outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-blue-700 flex items-center justify-center ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-5 w-5 inline-block mr-1" />
                      Save
                    </>
                  )}
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: "transparent", outline: "none" }}
                  onClick={() => {
                    setEditTask(null);
                    setFormData({ title: "", dueDate: "" });
                  }}
                  className="outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          className="fixed inset-0 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-sm z-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this task?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteTask}
                disabled={isLoading}
                style={{ backgroundColor: "transparent", outline: "none" }}
                className={`outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-red-700 flex items-center justify-center ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{ backgroundColor: "transparent", outline: "none" }}
                className="outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          className="fixed inset-0 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-sm z-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/signin");
                }}
                disabled={isLoading}
                style={{ backgroundColor: "transparent", outline: "none" }}
                className={`outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-red-700 flex items-center justify-center ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogout(false)}
                style={{ backgroundColor: "transparent", outline: "none" }}
                className="outline-none flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
