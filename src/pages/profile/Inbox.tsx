import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReduxInbox } from "@/hooks/useReduxInbox";
import { Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Promotion Card Component
function PromotionCard({ promo }: { promo: any }) {
  const { markPromotionAsRead } = useReduxInbox();
  
  const handleClick = () => {
    markPromotionAsRead(promo.id);
    // Handle promotion click (e.g., navigate to promotion details)
  };

  return (
    <div className="mb-6" onClick={handleClick}>
      <div className="text-center text-sm text-gray-600 mb-2">
        {formatDistanceToNow(new Date(promo.sentAt), { addSuffix: true })}
      </div>
      <div className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer">
        <div className="grid grid-cols-2 items-center px-4 py-3 bg-white">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-md">{promo.title}</h4>
              {!promo.read && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
            <p className="text-sm text-gray-500">{promo.description}</p>
          </div>
          <div className="text-right text-sm text-gray-400">
            {new Date(promo.sentAt).toLocaleDateString()}
          </div>
        </div>
        {promo.imageUrl && (
          <div className="p-4">
            <img
              src={promo.imageUrl}
              alt={promo.title}
              className="w-full h-full md:h-58 object-cover rounded-md border"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Thread Message Card Component
function ThreadMessageCard({ thread }: { thread: any }) {
  const { setCurrentThreadLocal, markThreadRead } = useReduxInbox();
  
  const handleClick = () => {
    setCurrentThreadLocal(thread.id);
    markThreadRead(thread.id);
    // In a real app, you might navigate to a thread detail page
  };

  return (
    <div 
      className="bg-white p-4 mb-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex -space-x-2">
              {thread.participants.slice(0, 3).map((participant: any, index: number) => (
                <div 
                  key={participant.id}
                  className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center ${index > 0 ? 'opacity-80' : ''}`}
                  title={participant.name}
                >
                  {participant.avatar ? (
                    <img 
                      src={participant.avatar} 
                      alt={participant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-600">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {thread.participants.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">
                    +{thread.participants.length - 3}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                {thread.title || thread.participants.map((p: any) => p.name).join(', ')}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 capitalize">{thread.threadType}</span>
                {thread.isPinned && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Pinned
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {thread.lastMessage && (
            <div className="ml-11">
              <p className="text-sm text-gray-600 truncate">
                <span className="font-medium">{thread.lastMessage.senderName}: </span>
                {thread.lastMessage.content}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: true })}
              </p>
            </div>
          )}
        </div>
        
        {thread.unreadCount > 0 && (
          <div className="flex flex-col items-end">
            <span className="bg-[#CC5500] text-white text-xs font-medium px-2 py-1 rounded-full min-w-6 text-center">
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ type }: { type: 'promotions' | 'threads' }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg dark:bg-[#303030]">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {type === 'promotions' ? (
          <MessageSquare className="w-8 h-8 text-gray-400" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type === 'promotions' ? 'Promotions' : 'Messages'} Yet
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        {type === 'promotions' 
          ? "You don't have any promotional messages at the moment. Check back later!"
          : "Your order and shipping messages will appear here once you have active orders."
        }
      </p>
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Loading messages...</p>
    </div>
  );
}

// --- Main Inbox Page ---
export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<"promotions" | "orders">("promotions");
  
  const {
    // Removed unused 'threads' variable
    promotions,
    loading,
    error,
    getThreads,
    getPromotions,
    getThreadsByType,
    getUnreadPromotionsCount,
    getUnreadCountByType,
  } = useReduxInbox();

  // Fetch data on component mount and tab change
  useEffect(() => {
    if (activeTab === "promotions") {
      getPromotions();
    } else {
      // Fixed: Removed threadType parameter since fetchThreads doesn't accept it
      getThreads();
    }
  }, [activeTab, getPromotions, getThreads]);

  // Filter threads for orders tab
  const orderThreads = getThreadsByType("order");
  const unreadPromotionsCount = getUnreadPromotionsCount();
  const unreadOrdersCount = getUnreadCountByType("order");

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error loading inbox</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => activeTab === "promotions" ? getPromotions() : getThreads()}
            className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-md mb-6">
        <h1 className="text-2xl font-medium">Inbox</h1>
        <p className="text-gray-600 text-sm mt-1">
          {activeTab === "promotions" 
            ? `You have ${unreadPromotionsCount} unread promotional message${unreadPromotionsCount !== 1 ? 's' : ''}`
            : `You have ${unreadOrdersCount} unread order message${unreadOrdersCount !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white p-0 rounded-md mb-4">
        <Tabs
          defaultValue="promotions"
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
        >
          <TabsList className="flex w-full justify-evenly p-10 bg-white shadow-none">
            <TabsTrigger
              value="promotions"
              className="flex-1 max-w-62 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11 relative"
            >
              Promotions
              {unreadPromotionsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CC5500] text-white text-xs rounded-full flex items-center justify-center">
                  {unreadPromotionsCount}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="orders"
              className="flex-1 max-w-62 border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#CC5500] data-[state=active]:text-[#CC5500] data-[state=active]:shadow-none rounded-none h-11 relative"
            >
              Orders & Shipping
              {unreadOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CC5500] text-white text-xs rounded-full flex items-center justify-center">
                  {unreadOrdersCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content area */}
      <div className="space-y-6">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* For Promotions tab */}
            {activeTab === "promotions" && (
              <div className="space-y-6">
                {/* Scam warning banner */}
                <div className="w-full bg-[#00A550] text-white text-sm py-3 px-4 rounded-md mb-6 text-center">
                  Be wary of scams and messages imitating World of Afrika. We don't
                  ask customers for extra fees via SMS or email.
                </div>

                {promotions.length === 0 ? (
                  <EmptyState type="promotions" />
                ) : (
                  promotions.map((promo) => (
                    <div key={promo.id} className="mx-auto bg-white p-8">
                      <PromotionCard promo={promo} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Orders & Shipping tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {orderThreads.length === 0 ? (
                  <EmptyState type="threads" />
                ) : (
                  orderThreads.map((thread) => (
                    <ThreadMessageCard key={thread.id} thread={thread} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}