import { useNavigate } from "react-router";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-(--dashboard-border) bg-(--dashboard-card) text-[10px] font-medium text-slate-500">
      <div className="mx-auto flex w-full max-w-360 items-center justify-between px-4 py-2">

        <div className="flex gap-4">
          <button
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => navigate("/privacy")}
            type="button"
          >
            Privacy
          </button>
          <button
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => navigate("/terms")}
            type="button"
          >
            Terms of Use
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
