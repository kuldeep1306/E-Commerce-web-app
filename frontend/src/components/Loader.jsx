export default function Loader({ full = false }) {
  return (
    <div className={`flex items-center justify-center ${full ? "min-h-[60vh]" : "py-10"}`}>
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
    </div>
  );
}
