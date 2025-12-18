"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Terminal } from "lucide-react"
import Image from "next/image"

export default function TerminalsPage() {
  return (
    <div className="space-y-6 pt-6">

      <Tabs defaultValue="virtual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="virtual" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Virtual Terminal
          </TabsTrigger>
          <TabsTrigger value="physical" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Physical Terminal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="virtual" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Virtual Terminal Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/30">
                  <div className="text-center p-8">
                    <div className="mb-4 flex items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-primary" />
                      </div>
                      <div className="w-32 h-32 border-4 border-foreground/20 rounded-lg flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-1">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-foreground/40 rounded"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <div className="w-12 h-8 bg-blue-600 rounded"></div>
                      <div className="w-12 h-8 bg-red-600 rounded"></div>
                      <div className="text-xs font-medium">MomoPay</div>
                      <div className="text-xs font-medium">T-Cash</div>
                      <div className="text-xs font-medium">ATMoney</div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Introducing Virtual Terminals</h2>
                  <p className="text-muted-foreground">
                    Virtual Terminal is only supported for registered businesses at the moment. Upgrade your business to start using Virtual Terminal.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700" size="lg">
                    Upgrade Business
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Physical Terminal Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border">
                  <div className="text-center p-8">
                    <div className="w-64 h-48 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl mx-auto shadow-2xl flex flex-col items-center justify-center border-4 border-slate-600 relative">
                      <div className="w-full h-16 bg-slate-800 rounded-t-xl mb-4 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">StepPay</span>
                      </div>
                      <div className="w-24 h-32 bg-slate-900 rounded-lg mb-2"></div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-slate-600 rounded"></div>
                        <div className="w-8 h-8 bg-slate-600 rounded"></div>
                        <div className="w-8 h-8 bg-slate-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Introducing StepPay Terminals</h2>
                  <p className="text-muted-foreground">
                    Terminal is currently only available to Ghanaian businesses. We're working hard to scale across Africa. Sign up to know when Terminal is available in your country
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700" size="lg">
                    Sign Up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

