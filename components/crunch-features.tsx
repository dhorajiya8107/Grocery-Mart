import { BarChart2, RefreshCw, Database, Search, Zap, LineChart } from "lucide-react"

export default function CarbonCrunchFeatures() {
  const features = [
    {
      icon: <Database className="w-6 h-6 text-green-500" />,
      title: "Automated Data Collection",
      description:
        "Our system automates carbon data collection, saving time, reducing errors, and ensuring accurate sustainability reporting.",
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-green-500" />,
      title: "Monitoring & Reporting",
      description:
        "Effortlessly track and report carbon emissions with automated monitoring, ensuring accuracy and compliance in sustainability reporting.",
    },
    {
      icon: <LineChart className="w-6 h-6 text-green-500" />,
      title: "Monitoring & Reporting",
      description:
        "Effortlessly track and report carbon emissions with automated monitoring, ensuring accuracy and compliance in sustainability reporting.",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-green-500" />,
      title: "Simplified Certification Process",
      description:
        "Streamline your certification process with our simplified, automated solution, reducing complexity and ensuring faster compliance.",
    },
    {
      icon: <Zap className="w-6 h-6 text-green-500" />,
      title: "AI-Driven Insights",
      description:
        "Leverage AI-driven insights to uncover hidden patterns, optimize sustainability strategies, and drive impactful decision-making.",
    },
    {
      icon: <Search className="w-6 h-6 text-green-500" />,
      title: "AI-Driven Insights",
      description:
        "Leverage AI-driven insights to uncover hidden patterns, optimize sustainability strategies, and drive impactful decision-making.",
    },
  ]

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <p className="text-green-600 font-medium uppercase tracking-wide mb-2">FEATURES</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          <span className="text-orange-400">Why</span> Carbon Crunch?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

