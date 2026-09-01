import React from 'react';
import Navbar from '../components/Navbar';
import { FaGithub, FaLinkedin, FaEnvelope, FaCode } from 'react-icons/fa';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#151515] border border-white/10 p-6 md:p-10 rounded-2xl shadow-xl"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#03C755] mb-10">
            About This Project
          </h1>

          {/* Project Motive */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-3">🎯 Project Motive</h2>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              Nutrilens is a personalized food insight web application. It's a user-friendly
              tool that lets users scan packaged food products and instantly get clear, visual
              information about the ingredients they contain — making that information more
              accessible, especially for people with dietary restrictions or health concerns.
            </p>

            <ul className="mt-5 space-y-2.5 text-sm md:text-base text-gray-300">
              <li>
                <span className="font-medium text-white">Barcode/QR Code Scanning</span> — scan any
                packaged product to fetch ingredient details from the database.
              </li>
              <li>
                <span className="font-medium text-white">Simple Visual Interface</span> — ingredients
                shown with easy-to-understand icons and color-coded indicators (harmful, moderate, safe).
              </li>
              <li>
                <span className="font-medium text-white">Personalized Feedback</span> — results tailored
                to each user's age, allergies, medical conditions, and dietary restrictions.
              </li>
              <li>
                <span className="font-medium text-white">Clean, Intuitive UI</span> — a modern, minimal
                design for smooth navigation across all age groups.
              </li>
            </ul>
          </section>

          {/* Technologies */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-3">🛠️ Technologies Used</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm md:text-base text-gray-300">
              <li className="flex items-center gap-2">
                <FaCode className="text-green-400 shrink-0" /> ReactJS & Tailwind CSS (Frontend)
              </li>
              <li className="flex items-center gap-2">
                <FaCode className="text-green-400 shrink-0" /> Node.js & Express.js (Backend)
              </li>
              <li className="flex items-center gap-2">
                <FaCode className="text-green-400 shrink-0" /> MongoDB (Database)
              </li>
              <li className="flex items-center gap-2">
                <FaCode className="text-green-400 shrink-0" /> Axios, Chart.js, Framer Motion etc.
              </li>
            </ul>
          </section>

          {/* Developer */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">🙋‍♂️ About Developer</h2>
            <div className="bg-black/20 border border-white/5 rounded-xl p-5 space-y-3 text-sm md:text-base">
              <p>
                <span className="font-medium text-white">Name:</span>{' '}
                <span className="text-gray-300">Siddharth Thakur</span>
              </p>

              <p className="flex items-center gap-2">
                <FaEnvelope className="text-blue-400 shrink-0" />
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=siddthakur06@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  siddthakur06@gmail.com
                </a>
              </p>

              <p className="flex items-center gap-2">
                <FaLinkedin className="text-blue-500 shrink-0" />
                <a
                  href="https://www.linkedin.com/in/siddharth-thakur-7a9888277"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  linkedin.com/in/siddharth-thakur
                </a>
              </p>

              <p className="flex items-center gap-2">
                <FaGithub className="text-gray-300 shrink-0" />
                <a
                  href="https://github.com/Siddn63"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  github.com/Siddn63
                </a>
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default About;