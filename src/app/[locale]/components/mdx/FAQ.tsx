// components/mdx/FAQ.tsx
import { useState } from "react";

export type FAQItem = {
  question: string
  answer: string
}

export const FAQ = ({ questions }: { questions: FAQItem[] }) => {
  const [openItem, setOpenItem] = useState(0)

  return (
    <div className="not-prose my-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold bg-blue-600 text-white p-4">คำถามที่พบบ่อย</h3>
      <div className="divide-y divide-gray-200">
        {questions.map((item, index) => (
          <div key={index} className="bg-white hover:bg-gray-50 transition-colors">
            <button
              className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
              onClick={() => setOpenItem(openItem === index ? -1 : index)}
            >
              <span className="font-medium text-gray-800">{item.question}</span>
              <svg
                className={`w-5 h-5 text-blue-500 transform transition-transform ${openItem === index ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openItem === index ? 'max-h-40 p-4 pt-0' : 'max-h-0'
              }`}
            >
              <p className="text-gray-600">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}