import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useIsMobile } from "@/hooks/use-mobile"; 

// Mock data
const savedAddresses = [
  {
    id: "address1",
    label: "Address 1",
    name: "Wandulu Victor",
    contact: "+256 743 027397",
    email: "wandulu@tekjuice.co.uk",
    address: "Plot 19 Binayomba Road",
  },
];

const savedPaymentMethods = [
  {
    id: "card1",
    type: "Bank Card",
    number: "4860 61** **** 9586",
    verified: true,
    icon: "visa",
  },
];

const shippingOptions = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 6.0,
    description: "Estimated delivery: 3-5 business days",
  },
  {
    id: "express",
    name: "DHL EXPRESS",
    price: 40.0,
    description: "Estimated delivery: 3-5 business days",
  },
];

export default function CheckoutPage() {
  const isMobile = useIsMobile();
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState("address1");
  const [useExistingPayment, setUseExistingPayment] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("card1");
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    country: "Uganda",
    lastName: "Wandulu",
    firstName: "Victor",
    email: "wandulu@tekjuice.co.uk",
    contact: "743 027395",
    countryCode: "+256",
    city: "Kampala",
    district: "Nakawa",
    detailedAddress: "",
    paymentMethod: "Bank Card",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  // Mock order data
  const subtotal = 40.0;
  const discount = 0;
  const selectedShippingOption = shippingOptions.find(
    (opt) => opt.id === selectedShipping
  );
  const shipping = selectedShippingOption?.price || 0;
  const total = subtotal + shipping - discount;
  const itemCount = 2;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    console.log("Placing order...", formData);
    // Add your checkout logic here
  };

  // Define which fields to hide on mobile
  const mobileHiddenFields = [
    "district",
    "detailedAddress",
    "expiryDate",
    "cvv",
  ];

  // Check if a field should be visible
  const shouldShowField = (fieldName: string) => {
    if (!isMobile) return true;
    return !mobileHiddenFields.includes(fieldName);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-center">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Billing Address & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Address Section */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Billing Address</h2>

              {/* Use Existing Address */}
              {useExistingAddress && savedAddresses.length > 0 && (
                <div className="mb-6">
                  <p className="text-center text-sm text-gray-700 mb-4">
                    Use an existing address
                  </p>

                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all bg-gray-50 ${
                          selectedAddress === address.id
                            ? "border-gray-300"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedAddress(address.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                selectedAddress === address.id
                                  ? "border-gray-400"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddress === address.id && (
                                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm mb-2">
                                {address.label}
                              </p>
                              <div className="text-sm text-gray-700 space-y-0.5">
                                <p>Name: {address.name}</p>
                                <p>Contact: {address.contact}</p>
                                <p>Email Address: {address.email}</p>
                                <p>Address: {address.address}</p>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <button
                        className="bg-white px-4 text-gray-600 hover:text-gray-900"
                        onClick={() => setUseExistingAddress(false)}
                      >
                        or input a new address
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* New Address Form */}
              {/* {!useExistingAddress && ( */}
                <div className="space-y-4">
                  {/* <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <button
                        className="bg-white px-4 text-gray-600 hover:text-gray-900"
                        onClick={() => setUseExistingAddress(true)}
                      >
                        or use an existing address
                      </button>
                    </div>
                  </div> */}

                  <div>
                    <Label htmlFor="country" className="text-sm font-normal">
                      Country <span className="text-orange-500">*</span>
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        handleInputChange("country", value)
                      }
                    >
                      <SelectTrigger id="country" className="min-h-11 mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Uganda">Uganda</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-normal">
                        Last name <span className="text-orange-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="h-11 mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-normal">
                        First name <span className="text-orange-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="h-11 mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-normal">
                        Email Address <span className="text-orange-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="h-11 mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact" className="text-sm font-normal">
                        Contact <span className="text-orange-500">*</span>
                      </Label>
                      <div className="flex gap-2 mt-1.5">
                        <Select
                          value={formData.countryCode}
                          onValueChange={(value) =>
                            handleInputChange("countryCode", value)
                          }
                        >
                          <SelectTrigger className="min-h-11 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+256">🇺🇬 +256</SelectItem>
                            <SelectItem value="+254">🇰🇪 +254</SelectItem>
                            <SelectItem value="+255">🇹🇿 +255</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="contact"
                          value={formData.contact}
                          onChange={(e) =>
                            handleInputChange("contact", e.target.value)
                          }
                          className="h-11 flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-sm font-normal">
                      City <span className="text-orange-500">*</span>
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleInputChange("city", value)}
                    >
                      <SelectTrigger id="city" className="min-h-11 mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kampala">Kampala</SelectItem>
                        <SelectItem value="Entebbe">Entebbe</SelectItem>
                        <SelectItem value="Jinja">Jinja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditionally show District field */}
                  {shouldShowField("district") && (
                    <div>
                      <Label htmlFor="district" className="text-sm font-normal">
                        District <span className="text-gray-400">(Optional)</span>
                      </Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value) =>
                          handleInputChange("district", value)
                        }
                      >
                        <SelectTrigger id="district" className="min-h-11 mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nakawa">Nakawa</SelectItem>
                          <SelectItem value="Kawempe">Kawempe</SelectItem>
                          <SelectItem value="Makindye">Makindye</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Conditionally show Detailed Address field */}
                  {shouldShowField("detailedAddress") && (
                    <div>
                      <Label htmlFor="detailedAddress" className="text-sm font-normal">
                        Additional details / Detailed Address{" "}
                        <span className="text-gray-400">(Optional)</span>
                      </Label>
                      <Textarea
                        id="detailedAddress"
                        value={formData.detailedAddress}
                        onChange={(e) =>
                          handleInputChange("detailedAddress", e.target.value)
                        }
                        className="min-h-24 resize-none mt-1.5"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="setDefault" className="cursor-pointer text-sm font-normal">
                      Set as default
                    </Label>
                    <Switch
                      id="setDefault"
                      checked={setAsDefault}
                      onCheckedChange={setSetAsDefault}
                    />
                  </div>
                </div>
              {/* )} */}
            </div>

            {/* Payment Method Section */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

              {/* Saved Payment Method */}
              {useExistingPayment && savedPaymentMethods.length > 0 && (
                <div className="mb-6">
                  <p className="text-center text-sm text-gray-700 mb-4">
                    Saved payment method
                  </p>

                  <div className="space-y-3">
                    {savedPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all bg-gray-50 ${
                          selectedPayment === method.id
                            ? "border-gray-300"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">
                                VISA
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm mb-1">
                                {method.type}
                              </p>
                              <p className="text-sm text-gray-700 mb-1">
                                {method.number}
                              </p>
                              {method.verified && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Verified
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPayment === method.id
                                ? "border-gray-400"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPayment === method.id && (
                              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <button
                        className="bg-white px-4 text-gray-600 hover:text-gray-900"
                        onClick={() => setUseExistingPayment(false)}
                      >
                        or input a payment method
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* New Payment Method Form */}
              {/* {!useExistingPayment && ( */}
                <div className="space-y-4">
                  {/* <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <button
                        className="bg-white px-4 text-gray-600 hover:text-gray-900"
                        onClick={() => setUseExistingPayment(true)}
                      >
                        or use saved payment method
                      </button>
                    </div>
                  </div> */}

                  <div>
                    <Label htmlFor="paymentMethod" className="text-sm font-normal">
                      Payment method
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        handleInputChange("paymentMethod", value)
                      }
                    >
                      <SelectTrigger id="paymentMethod" className="min-h-11 mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Card">Bank Card</SelectItem>
                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-normal">
                      Card number
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="cardNumber"
                        placeholder=""
                        value={formData.cardNumber}
                        onChange={(e) =>
                          handleInputChange("cardNumber", e.target.value)
                        }
                        className="h-11 pr-32"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                        <Badge variant="outline" className="h-6 px-1.5 border-gray-300">
                          <span className="text-xs font-semibold">Apple Pay</span>
                        </Badge>
                        <Badge variant="outline" className="h-6 px-1.5 border-gray-300">
                          <span className="text-xs font-semibold text-blue-600">VISA</span>
                        </Badge>
                        <Badge variant="outline" className="h-6 px-1.5 border-gray-300">
                          <span className="text-xs font-semibold">
                            <span className="text-red-600">●</span>
                            <span className="text-orange-500">●</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardholderName" className="text-sm font-normal">
                      Cardholder name
                    </Label>
                    <Input
                      id="cardholderName"
                      value={formData.cardholderName}
                      onChange={(e) =>
                        handleInputChange("cardholderName", e.target.value)
                      }
                      className="h-11 mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Conditionally show Expiry Date field */}
                    {shouldShowField("expiryDate") && (
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm font-normal">
                          Expiry date
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder=""
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className="h-11 mt-1.5"
                        />
                      </div>
                    )}
                    
                    {/* Conditionally show CVV field */}
                    {shouldShowField("cvv") && (
                      <div>
                        <Label htmlFor="cvv" className="text-sm font-normal">
                          CVV/CVC
                        </Label>
                        <Input
                          id="cvv"
                          placeholder=""
                          value={formData.cvv}
                          onChange={(e) =>
                            handleInputChange("cvv", e.target.value)
                          }
                          className="h-11 mt-1.5"
                        />
                      </div>
                    )}
                  </div>

                  {/* Show full width on mobile if fields are hidden */}
                  {isMobile && (mobileHiddenFields.includes("expiryDate") || mobileHiddenFields.includes("cvv")) && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm font-normal">
                          Expiry date
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder=""
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className="h-11 mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm font-normal">
                          CVV/CVC
                        </Label>
                        <Input
                          id="cvv"
                          placeholder=""
                          value={formData.cvv}
                          onChange={(e) =>
                            handleInputChange("cvv", e.target.value)
                          }
                          className="h-11 mt-1.5"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="saveCard" className="cursor-pointer text-sm font-normal">
                      Save this card
                    </Label>
                    <Switch
                      id="saveCard"
                      checked={saveCard}
                      onCheckedChange={setSaveCard}
                    />
                  </div>
                </div>
              {/* )} */}
            </div>
          </div>

          {/* Right Column - Shipping & Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 shadow-none border-none rounded-lg">
              {/* Shipping Options */}
              <h3 className="font-semibold mb-2">Shipping Options</h3>

              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedShipping === option.id
                        ? "border-[#CC5500] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedShipping(option.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            selectedShipping === option.id
                              ? "border-[#CC5500]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedShipping === option.id && (
                            <div className="w-3 h-3 bg-[#CC5500] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {option.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        USD {option.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <h3 className="font-semibold mb-4">
                Items <span className="font-normal text-gray-600">(a)</span> total
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">USD {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shop discount</span>
                  <span className="font-medium">USD {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">USD {shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">
                    Estimated total ({itemCount} items)
                  </span>
                  <span className="font-semibold text-[#303030]">
                    USD {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full h-11 bg-[#CC5500] hover:bg-[#CC5500]/90 rounded-full text-white font-semibold mt-6"
              >
                Place Order
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}