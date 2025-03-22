import Image from "next/image"
import { ChevronDown } from "lucide-react"
import Servicesimage  from '../images/Home/Services.png';

export default function ServicesSection() {
  return (
    <section className="relative py-16 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Purple vertical line */}
      <div className="absolute left-1/2 top-32 bottom-0 w-0.5 hidden md:block"></div>

      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <p className="text-green-600 font-medium uppercase tracking-wide mb-2">OUR SERVICES</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          What do <span className="text-orange-400">we do</span>?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column - Image */}
        <div className="flex justify-center md:justify-end pr-0 md:pr- relative z-10">
          <div className="">
            <Image
              src={Servicesimage}
              alt="Services Image"
              width={1000}
              height={1000}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Right column - Services */}
        <div className="space-y-6 md:pl-12">
          {/* Service Card 1 */}
          <ServiceCard />

          {/* Service Card 2 */}
          <ServiceCard />
        </div>
      </div>
    </section>
  )
}

function ServiceCard() {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h3 className="text-2xl font-bold mb-3">GHG Accounting</h3>
      <p className="text-gray-700 mb-4">
        We provide GHG accounting services, measuring and reporting Scope 1, 2, and 3 emissions. Our process ensures
        compliance and helps organizations track and reduce their carbon footprint.
      </p>
      <button className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-200 transition-colors">
        See More Details
      </button>
    </div>
  )
}

