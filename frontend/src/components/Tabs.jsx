export default function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <nav className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? "tab activeTab" : "tab"}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}