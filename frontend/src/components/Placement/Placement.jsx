// Individual components for each section

import { TbMarquee } from "react-icons/tb";
import Footer from "../Home/Footer";
import Marquee from "react-fast-marquee";
import HeroImage from "../../assets/PlacementHeroImage.jpg";

import FICO from "../../assets/Company Logs/FICO.jpg";
import Cognizant from "../../assets/Company Logs/Cognizant.jpg";
import ZignEx from "../../assets/Company Logs/ZIGNEX.jpg";
import Helpshift from "../../assets/Company Logs/help.jpg";
import Metafic from "../../assets/Company Logs/metafic.jpg";
import Gammastack from "../../assets/Company Logs/gammastack.jpg";
import Infosys from "../../assets/Company Logs/infosys.jpg";
import Yash_Technologies from "../../assets/Company Logs/yashtech.png";
import Accenture from "../../assets/Company Logs/accenture.jpg";
import TCS_Digital from "../../assets/Company Logs/tcs.jpg";
import Capgemini from "../../assets/Company Logs/capgemini.jpg";
import Cognam from "../../assets/Company Logs/cognam.jpg";
import Incedo from "../../assets/Company Logs/incedo.jpg";
import LTI from "../../assets/Company Logs/lti.jpg";
import DICE from "../../assets/Company Logs/DICE.png";
// import topStudentImg from '../../assets/placement.jpg';

import Aadiya_Bansal_img from '../../assets/Top Students image/Aaditya_Bansal.jpeg';
import Rashi_Dashore_img from '../../assets/Top Students image/Rashi Dashore.jpeg';
import Riya_Kathiari_img from '../../assets/Top Students image/Riya Kathiari.jpeg';
import Saloni_Vishwakarma_img from '../../assets/Top Students image/Saloni Vishwakarma.jpeg';

const HeroSection = () => {
  return (
    <section className="bg-[#fffefe] md:py-20 py-10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-[#2b3333] mb-6 leading-tight text-center  md:text-left">
              Placement Success Stories!
            </h1>
            <p className="text-xl text-[#2b3333] mb-8 opacity-80 text-center md:text-left">
              Discover our outstanding placement records, top recruiters, and
              success stories of our highest achievers in leading companies
              worldwide.
            </p>
            <div className="text-center md:text-left">
              {" "}
              <button
                className="px-8 py-4 bg-[#2b3333] text-[#fffefe]  rounded-lg
             text-lg font-bold cursor-pointer m-auto"
              >
                Explore Placements!
              </button>
            </div>
          </div>

          <img
            src={HeroImage}
            alt="Placement Success Illustration"
            className="w-[450px]"
          />
        </div>
      </div>
    </section>
  );
};

const PlacementStats = () => {
  const stats = [
    { label: "Placement Rate", value: "95%", icon: "📈" },
    { label: "Companies Visited", value: "150+", icon: "🏢" },
    { label: "Students Placed", value: "280+", icon: "👥" },
    { label: "Highest Package", value: "₹45 LPA", icon: "🏆" },
  ];

  return (
    <section className="bg-gray-50 md:py-20">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-4xl font-bold text-center text-[#2b3333] mb-12">
          Placement Statistics 2024
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#fffefe] py-10 px-5 rounded-xl text-center border-2 border-gray-100 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-[#c79745] hover:shadow-lg hover:shadow-[#c79745]/10"
            >
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className="text-4xl font-bold text-[#c79745] mb-2">
                {stat.value}
              </div>
              <div className="text-lg text-[#2b3333] font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TopStudents = () => {
  const students = [
    {
      name: "Aaditya Bansal",
      company: "Twitter",
      package: "₹72 LPA",
      role: "AI Turur",
      location: "Work from home",
      Image: Aadiya_Bansal_img
    
    },
    {
      name: "Riya Kothari",
      company: "Lumber",
      package: "₹15 LPA",
      role: "Quality Assurance Engineer",
      location: "Bengaluru",
      Image: Riya_Kathiari_img
    
    },
    {
      name: "Rashi Dashore",
      company: "Dice",
      package: "₹16 LPA",
      role: "Software Development Engineer",
      location: "Pune",
      Image: Rashi_Dashore_img
    
    },
    {
      name: "Saloni Vishwakarma",
      company: "Dice",
      package: "₹10 LPA",
      role: "Business Analyst",
      location: "Pune",
      Image: Saloni_Vishwakarma_img
    },
  ];

  return (
    <section className="bg-[#fffefe] py-20">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-4xl font-bold text-center text-[#2b3333] mb-4">
          Our Top Achievers
        </h2>
        <p className="text-center text-xl text-[#2b3333] opacity-70 mb-12">
          Meet our highest placed students who are making us proud
        </p>
        <div className="flex flex-col justify-around items-center gap-10 lg:flex-row">
          {students.map((student, index) => (
            <div
              key={index}
              className="bg-[#fffefe] border-2 border-gray-200 rounded-xl p-6 text-center transition-all duration-300
               cursor-pointer  hover:border-[#c79745] hover:shadow-xl hover:shadow-[#c79745]/10 sm:w-[300px] w-[280px]"
            >
              <div className="mb-5">
                <div className="relative inline-block mb-4">
                  <img
                    src={student.Image}
                    alt={student.name}
                    className="w-30 h-30 rounded-full border-2 border-[#c79745]"
                  />
                
                </div>
                <h3 className="text-2xl font-bold text-[#2b3333] mb-2">
                  {student.name}
                </h3>
                <div className="text-xl font-bold text-[#c79745] mb-4">
                  {student.package}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base">🏢</span>
                  <span className="text-sm text-[#2b3333]">
                    {student.company}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base">💼</span>
                  <span className="text-sm text-[#2b3333]">{student.role}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base">📍</span>
                  <span className="text-sm text-[#2b3333]">
                    {student.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TopRecruiters = () => {
  const recruiters = [
    [FICO, Cognizant, ZignEx, Helpshift, Metafic],
    [Gammastack, Infosys, Yash_Technologies, Accenture, TCS_Digital],
    [Capgemini, Cognam, Incedo, LTI, DICE],
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-4xl font-bold text-center text-[#2b3333] mb-12">
          Our Top Recruiters
        </h2>
        {recruiters.map((logoList, index) => (
          <Marquee
            key={index}
            direction={index % 2 === 0 ? "left" : "right"}
            className="mb-8"
          >
            {logoList.map((companyLogo, logoIndex) => (
              <div
                key={logoIndex}
                className="bg-[#fffefe] h-40 w-48 flex items-center
                 justify-center p-6 mx-4 rounded-xl border-2
                  border-gray-100 transition-all duration-300 cursor-pointer shadow-lg"
              >
                <img
                  src={companyLogo}
                  alt={`Company logo ${logoIndex}`}
                  className="max-h-24 object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
};

// Main App Component
const Placement = () => {
  return (
    <div className="leading-relaxed text-[#2b3333] m-0 p-0">
      <HeroSection />
      <PlacementStats />
      <TopStudents />
      <TopRecruiters />
    </div>
  );
};

export default Placement;
