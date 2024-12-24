"use client";

import { Edit, LogOut, Search, Wallet } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { logoutUserAction } from "@/actions/logout";
import * as z from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchPostsAction } from "@/actions/blogInteractions";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import PaypalButton from "../payment/paypal";
import { prePaymentAction } from "@/actions/prePayment";

const searchSchema = z.object({
  query: z.string().min(1, "Query is required"),
});

export default function Header({ user }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPaymentDialog, setIsPaymentDialog] = useState(false);
  const [showPaypalButton, setShowPaypalButton] = useState(false);
  const [paymentEmail, setPaymentEmail] = useState("");
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(searchSchema),
  });

  console.log(user, "useruseruser");

  async function onSearchSubmit(data) {
    setIsLoading(true);
    try {
      const result = await searchPostsAction(data.query);
      console.log(result);
      if (result.success) {
        setSearchResults(result.posts);
        setIsSheetOpen(true);
        reset();
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    const result = await logoutUserAction();
    if (result.success) {
      router.push("/login");
    } else {
      console.error(result.error);
    }
  }

  async function handleProceedWithCheckout() {
    try {
      const result = await prePaymentAction(paymentEmail);
      console.log(result, "handleProceedWithCheckout");

      if (result.success) {
        setPaymentEmail("");
        setShowPaypalButton(true);
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1
                onClick={() => router.push("/")}
                className="text-2xl cursor-pointer font-bold font-serif tracking-tighter"
              >
                <span className="bg-black text-white px-2 py-1 rounded-full">
                  M
                </span>
                <span className="ml-1">Medium</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Input
                  {...register("query")}
                  type="text"
                  placeholder="Search blogs..."
                  className="pl-10 pr-4 py-1 w-64 rounded-full bg-gray-100 border-0 focus-visible:ring-1"
                />
                <Search
                  onClick={handleSubmit(onSearchSubmit)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 cursor-pointer"
                />
              </div>
              <Button
                onClick={() => router.push("/blog/create")}
                variant="ghost"
                size="icon"
              >
                <Edit className="h-6 w-6" />
              </Button>
              {!user?.isPremium ? (
                <Button
                  onClick={() => setIsPaymentDialog(true)}
                  variant="ghost"
                  size="icon"
                >
                  <Wallet className="w-6 h-6" />
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.isPremium && (
                    <DropdownMenuItem>
                      <span>Premium User</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[540px] sm:max-w-full"
        >
          <SheetHeader className={"flex justify-between items-center"}>
            <SheetTitle>Search Results</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {searchResults && searchResults.length > 0 ? (
              searchResults.map((searchResultItem) => (
                <article
                  onClick={() => {
                    setIsSheetOpen(false);
                    router.push(`/blog/${searchResultItem._id}`);
                  }}
                  key={searchResultItem._id}
                  className={`cursor-pointer
                     flex gap-6
                   bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden`}
                >
                  <div className={`w-1/3 h-full relative`}>
                    <img
                      src={searchResultItem?.coverImage}
                      alt={searchResultItem?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`flex-1 p-4 w-2/3`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>
                          {searchResultItem?.author?.name[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[16px] font-medium text-gray-700">
                        {searchResultItem?.author?.name}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">
                      {searchResultItem?.title}
                    </h3>
                    <div>
                      <span>
                        {new Date(
                          searchResultItem?.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <h3>No blogs found</h3>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <Dialog
        open={isPaymentDialog}
        onOpenChange={() => {
          setIsPaymentDialog(false);
          setShowPaypalButton(false);
        }}
      >
        <DialogContent className="max-h-[600px] overflow-auto">
          <DialogTitle>Payment</DialogTitle>
          {showPaypalButton ? (
            <PaypalButton setIsPaymentDialog={setIsPaymentDialog} />
          ) : (
            <div>
              <Input
                value={paymentEmail}
                onChange={(event) => setPaymentEmail(event.target.value)}
                placeholder="Enter your email to proceed!"
              />
              <Button
                onClick={handleProceedWithCheckout}
                className="w-full mt-3"
              >
                Proceed with Checkout
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
