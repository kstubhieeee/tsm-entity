"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ApiTest() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string>("")

  const testApi = async (endpoint: string, method: string = "GET", body?: any) => {
    setLoading(endpoint)
    try {
      const response = await fetch(endpoint, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined
      })

      const data = await response.json()
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          data,
          success: response.ok
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 0,
          error: error instanceof Error ? error.message : String(error),
          success: false
        }
      }))
    } finally {
      setLoading("")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Test Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => testApi("/api/test")}
            disabled={loading === "/api/test"}
          >
            Test Basic API
          </Button>
          
          <Button 
            onClick={() => testApi("/api/doctors")}
            disabled={loading === "/api/doctors"}
          >
            Test Doctors API
          </Button>
          
          <Button 
            onClick={() => testApi("/api/appointments")}
            disabled={loading === "/api/appointments"}
          >
            Test Appointments API
          </Button>
          
          <Button 
            onClick={() => testApi("/api/payment/create-order", "POST", { amount: 100 })}
            disabled={loading === "/api/payment/create-order"}
          >
            Test Payment API
          </Button>
        </div>

        <div className="space-y-2">
          {Object.entries(results).map(([endpoint, result]: [string, any]) => (
            <div key={endpoint} className="p-4 border rounded">
              <h4 className="font-bold">{endpoint}</h4>
              <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                Status: {result.status} - {result.success ? 'Success' : 'Failed'}
              </div>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(result.data || result.error, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
