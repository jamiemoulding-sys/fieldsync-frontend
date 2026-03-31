import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">
          ⚡ FieldSync
        </h1>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate('/login')}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* HERO */}
      <div className="text-center py-28 px-6 max-w-5xl mx-auto">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          Run Your Workforce <br />
          <span className="text-indigo-400">Without the Chaos</span>
        </h1>

        <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
          FieldSync helps you manage employees, track time, and stay in control —
          all from one powerful platform built for real businesses.
        </p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition"
          >
            Start Free Trial
          </button>

          <button className="border border-white/20 px-6 py-3 rounded-lg text-lg hover:bg-white/10 transition">
            View Demo
          </button>
        </div>

      </div>

      {/* PROBLEM → SOLUTION */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">
            Still managing your team like this?
          </h2>
          <p className="text-gray-400 mt-3">
            Most businesses are stuck using outdated systems that slow them down
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-400">
              ❌ The old way
            </h3>

            <ul className="space-y-3 text-gray-300">
              <li>• Spreadsheets that get messy fast</li>
              <li>• No visibility on who’s working</li>
              <li>• Chasing staff for updates</li>
              <li>• Manual scheduling headaches</li>
              <li>• Missed hours and payroll errors</li>
            </ul>
          </div>

          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              ✅ The FieldSync way
            </h3>

            <ul className="space-y-3 text-gray-300">
              <li>• Real-time employee tracking</li>
              <li>• Clear dashboard with everything in one place</li>
              <li>• Automated scheduling & time logs</li>
              <li>• Instant insights and reports</li>
              <li>• Accurate data you can trust</li>
            </ul>
          </div>

        </div>

      </div>

      {/* DASHBOARD PREVIEW */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">
            Everything in one place
          </h2>
          <p className="text-gray-400 mt-3">
            Manage your entire workforce from a single dashboard
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur shadow-2xl">

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Active Employees</p>
              <p className="text-2xl font-bold mt-2">24</p>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Hours Today</p>
              <p className="text-2xl font-bold mt-2">182h</p>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Tasks Completed</p>
              <p className="text-2xl font-bold mt-2">56</p>
            </div>
          </div>

          <div className="mt-6 bg-black/30 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-3">Live Activity</p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>John Smith clocked in</span>
                <span>08:03</span>
              </div>
              <div className="flex justify-between">
                <span>Sarah completed task</span>
                <span>09:12</span>
              </div>
              <div className="flex justify-between">
                <span>Mike started shift</span>
                <span>09:45</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Trusted by growing teams</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p>“FieldSync completely changed how we manage staff.”</p>
            <p className="mt-4 font-semibold">James Carter</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p>“We save hours every week.”</p>
            <p className="mt-4 font-semibold">Sarah Mitchell</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p>“Exactly what we needed to scale.”</p>
            <p className="mt-4 font-semibold">David Khan</p>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>

        <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-semibold">FieldSync Standard</h3>
          <p className="text-5xl font-bold mt-4">£6</p>
          <p className="text-gray-400">per employee / month</p>

          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 w-full mt-6 py-3 rounded-lg"
          >
            Start Free Trial
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-20 border-t border-white/10">
        <h2 className="text-3xl font-bold">
          Built for teams that actually work
        </h2>

        <button
          onClick={() => navigate('/login')}
          className="bg-white text-black mt-6 px-8 py-3 rounded-lg"
        >
          Get Started
        </button>
      </div>

    </div>
  );
}

export default LandingPage;