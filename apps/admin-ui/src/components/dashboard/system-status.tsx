"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@supply-stream/ui"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Auth",
    cpu: 85,
    memory: 70,
    requests: 120,
  },
  {
    name: "Procurement",
    cpu: 65,
    memory: 55,
    requests: 90,
  },
  {
    name: "Bidding",
    cpu: 45,
    memory: 40,
    requests: 60,
  },
  {
    name: "Notification",
    cpu: 30,
    memory: 25,
    requests: 40,
  },
  {
    name: "Database",
    cpu: 75,
    memory: 80,
    requests: 0,
  },
]

export function SystemStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cpu" name="CPU (%)" fill="#8884d8" />
              <Bar dataKey="memory" name="Memory (%)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-md bg-green-50 p-3">
            <div className="text-sm font-medium text-green-800">All Services Operational</div>
            <div className="text-xs text-green-600">Last checked: 5 minutes ago</div>
          </div>
          <div className="rounded-md bg-blue-50 p-3">
            <div className="text-sm font-medium text-blue-800">Database Load: Normal</div>
            <div className="text-xs text-blue-600">Current connections: 42</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
