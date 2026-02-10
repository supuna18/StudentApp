import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";

function App() {
  return (
    // මුළු පිටුවටම Blue & White theme එක සහ Selection color එක දානවා
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-600">
      
      {/* උඩින්ම තියෙන Navbar එක */}
      <Navbar />

      {/* ප්‍රධාන පෙනුම (Hero Section) */}
      <main>
        <Hero />
      <Features /> {/* අලුතින් හැදූ කොටස */}
      </main>

      {/* ඊළඟට අපි මෙතනට Modules Section එක එකතු කරමු */}
      
    </div>
  );
}

export default App;