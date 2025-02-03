import { Home, Search, Library } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80">
      <div className="flex justify-around dancing-script">
        {[
          { icon: Home, label: "Home" },
          { icon: Search, label: "Search" },
          { icon: Library, label: "Library" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label.toLowerCase())}
            className={`p-4 flex flex-col items-center ${
              activeTab === item.label.toLowerCase()
                ? "text-amber-500"
                : "text-amber-200/60"
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
