"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Database, MagnifyingGlass, FileText, BookOpen, Link, Calendar, ArrowRight } from "phosphor-react"

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const researchPapers = [
    {
      id: "1",
      title: "Advances in AI-Powered Medical Diagnosis: A Comprehensive Review",
      authors: "Dr. Smith, J., et al.",
      journal: "Journal of Medical AI",
      year: 2024,
      category: "AI/ML",
      abstract: "This comprehensive review explores the latest developments in artificial intelligence applications for medical diagnosis, focusing on multi-agent systems and their clinical effectiveness.",
      link: "#",
      citations: 142
    },
    {
      id: "2",
      title: "Machine Learning in Cardiovascular Disease Prediction",
      authors: "Dr. Johnson, M., et al.",
      journal: "Cardiology Today",
      year: 2023,
      category: "Cardiology",
      abstract: "A study examining the use of machine learning algorithms to predict cardiovascular events with improved accuracy compared to traditional risk assessment methods.",
      link: "#",
      citations: 89
    },
    {
      id: "3",
      title: "Deep Learning for Early Detection of Neurological Disorders",
      authors: "Dr. Chen, L., et al.",
      journal: "Neurology Research",
      year: 2024,
      category: "Neurology",
      abstract: "Novel deep learning approaches for early detection and classification of neurological disorders using neuroimaging data and clinical symptoms.",
      link: "#",
      citations: 203
    },
    {
      id: "4",
      title: "Natural Language Processing in Clinical Documentation",
      authors: "Dr. Williams, A., et al.",
      journal: "Health Informatics",
      year: 2023,
      category: "Health IT",
      abstract: "Exploring NLP techniques for automated extraction and analysis of clinical information from unstructured medical records.",
      link: "#",
      citations: 156
    }
  ]

  const categories = ["All", "AI/ML", "Cardiology", "Neurology", "Health IT", "Oncology", "Pediatrics"]

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">Medical Research</h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">AI-powered medical literature and research</p>
        </div>

        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
              <Database size={20} weight="regular" />
              Research Database
            </CardTitle>
            <CardDescription className="font-sans">Search medical literature and research papers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <MagnifyingGlass size={20} weight="regular" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(55,50,47,0.50)]" />
                <Input
                  placeholder="Search research papers, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border border-[rgba(55,50,47,0.12)]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    className="bg-white border border-[rgba(55,50,47,0.12)] text-[#37322F] hover:bg-[oklch(0.6_0.2_45)] hover:text-white cursor-pointer"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {researchPapers.map((paper) => (
            <Card key={paper.id} className="border border-[rgba(55,50,47,0.12)] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-sans font-semibold text-[#37322F]">{paper.title}</h3>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        {paper.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[rgba(55,50,47,0.80)] mb-3">
                      <div className="flex items-center gap-1">
                        <FileText size={16} weight="regular" />
                        <span>{paper.authors}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={16} weight="regular" />
                        <span>{paper.journal}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} weight="regular" />
                        <span>{paper.year}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[rgba(55,50,47,0.80)] mb-4 leading-relaxed">{paper.abstract}</p>
                    <div className="flex items-center gap-4 text-sm text-[rgba(55,50,47,0.80)]">
                      <span className="font-medium">{paper.citations} citations</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-[rgba(55,50,47,0.12)]"
                  >
                    <FileText size={16} weight="regular" className="mr-2" />
                    Read Abstract
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90"
                  >
                    <Link size={16} weight="regular" className="mr-2" />
                    View Full Paper
                    <ArrowRight size={16} weight="regular" className="ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
              <Database size={20} weight="regular" />
              Research Tools
            </CardTitle>
            <CardDescription className="font-sans">Access additional research resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start border border-[rgba(55,50,47,0.12)]"
              >
                <Database size={24} weight="regular" className="mb-2 text-[oklch(0.6_0.2_45)]" />
                <span className="font-sans font-semibold text-[#37322F]">PubMed Database</span>
                <span className="text-xs text-[rgba(55,50,47,0.80)] mt-1">Access medical literature</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start border border-[rgba(55,50,47,0.12)]"
              >
                <FileText size={24} weight="regular" className="mb-2 text-[oklch(0.6_0.2_45)]" />
                <span className="font-sans font-semibold text-[#37322F]">Clinical Trials</span>
                <span className="text-xs text-[rgba(55,50,47,0.80)] mt-1">Browse ongoing studies</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start border border-[rgba(55,50,47,0.12)]"
              >
                <BookOpen size={24} weight="regular" className="mb-2 text-[oklch(0.6_0.2_45)]" />
                <span className="font-sans font-semibold text-[#37322F]">Medical Journals</span>
                <span className="text-xs text-[rgba(55,50,47,0.80)] mt-1">Latest publications</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
