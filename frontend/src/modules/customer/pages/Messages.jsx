import CustomerDashboardLayout from "../layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import ChatWindow from "../../../components/ChatWindow";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Users } from "lucide-react";

export default function CustomerMessages() {
  const [selectedChat, setSelectedChat] = useState(null); // e.g., chatId from job or technician

  return (
    <CustomerDashboardLayout>
      <div className="container py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Messages
          </h1>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Chats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Mock chats - replace with React Query fetch */}
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className={`p-3 rounded-md cursor-pointer hover:bg-accent ${selectedChat === id ? 'bg-accent' : ''}`}
                  onClick={() => setSelectedChat(id)}
                >
                  <div className="font-medium">Technician {id}</div>
                  <div className="text-sm text-muted-foreground">Job #1234</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Select a chat to start messaging</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChat ? (
                <ChatWindow chatId={selectedChat} />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No chat selected
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}