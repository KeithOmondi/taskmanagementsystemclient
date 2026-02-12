import React, { useState, useEffect } from "react";
import { X, Check, ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "../../store/hooks";
import {
  createCategory,
  fetchCategoryTree,
} from "../../store/slices/categoriesSlice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SuperAdminAddCategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentParent, setCurrentParent] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  const [children, setChildren] = useState<
    { _id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return toast.error("Name required");
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(
        createCategory({
          name: name.trim(),
          parentId: currentParent?._id || null,
        })
      ).unwrap();

      if (!currentParent) {
        setCurrentParent({
          _id: result._id,
          name: result.name,
        });
        setChildren([]);
        toast.success("Parent created. You can now add children.");
      } else {
        setChildren((prev) => [
          ...prev,
          { _id: result._id, name: result.name },
        ]);
        toast.success("Child added.");
      }

      setName("");
    } catch (err: any) {
      toast.error(err || "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    try {
      await dispatch(fetchCategoryTree());
      toast.success("Hierarchy saved successfully.");

      // Reset state
      setCurrentParent(null);
      setChildren([]);
      setName("");

      // Close modal
      onClose();
    } catch {
      toast.error("Failed to finalize structure.");
    }
  };

  const startNewParent = () => {
    setCurrentParent(null);
    setChildren([]);
    setName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-12">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-serif font-bold text-[#1E3A2B]">
            {!currentParent
              ? "Create Main Category"
              : currentParent.name.toUpperCase()}
          </h2>

          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-rose-500" size={24} />
          </button>
        </div>

        {/* BODY */}
        {!currentParent ? (
          <>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter parent category..."
              className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C69214] rounded-2xl px-6 py-5 text-lg font-semibold outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-6 w-full bg-[#1E3A2B] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#0F1A13] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Create & Drill Down
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-6 uppercase font-bold tracking-wider">
              Add children under this category
            </p>

            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Add sub-category to ${currentParent.name}...`}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C69214] rounded-2xl px-6 py-5 text-lg font-semibold outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[#1E3A2B] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#0F1A13] transition disabled:opacity-50"
              >
                Add Child
              </button>

              <button
                onClick={startNewParent}
                className="px-6 bg-gray-100 text-[#1E3A2B] rounded-2xl hover:bg-gray-200 transition flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                New Parent
              </button>
            </div>

            {children.length > 0 && (
              <div className="mt-10 border-t pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Sub-Categories
                </h3>

                <ul className="space-y-3">
                  {children.map((child) => (
                    <li
                      key={child._id}
                      className="bg-gray-50 px-4 py-3 rounded-xl text-sm font-semibold"
                    >
                      ↳ {child.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FINAL SAVE BUTTON */}
            <button
              onClick={handleFinish}
              className="mt-10 w-full bg-amber-500 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-amber-600 transition flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Finish & Save
            </button>
          </>
        )}

        <div className="mt-12 text-center text-[10px] text-gray-400 uppercase font-bold tracking-tight">
          Build your hierarchy progressively. Parent first, then children.
        </div>

      </div>
    </div>
  );
};

export default SuperAdminAddCategoryModal;
