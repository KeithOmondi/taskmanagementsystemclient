import React, { useEffect } from "react";
import { socket } from "../services/socket";
import { useAppDispatch } from "../store/hooks";
import { fetchAllTasks } from "../store/slices/superAdminSlice"; 
import { toast } from "react-hot-toast";

const SocketListener: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    socket.connect();

    socket.on("task_updated", (updatedTask) => {
      // 1. Refresh the store
      dispatch(fetchAllTasks());

      // 2. Alert the Admin
      toast(`Objective Updated: ${updatedTask.title} is now ${updatedTask.status}`, {
        icon: '📡',
        style: {
          borderRadius: '10px',
          background: '#1E3A2B',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        },
      });
    });

    return () => {
      socket.off("task_updated");
      socket.disconnect();
    };
  }, [dispatch]);

  return null;
};

export default SocketListener;