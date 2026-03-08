import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlaceOrderRequest {
    customerName: string;
    prescriptionNote?: string;
    address: {
        city: string;
        line1: string;
        pincode: string;
    };
    items: Array<{
        productId: bigint;
        quantity: bigint;
    }>;
    phoneNumber: string;
}
export interface PlaceOrderResponse {
    orderId: bigint;
    timestamp: Time;
    totalPrice: number;
}
export type Time = bigint;
export interface Order {
    customerName: string;
    paymentStatus: Variant_paymentConfirmed_awaitingVerification_rejected;
    orderId: bigint;
    prescriptionNote?: string;
    address: {
        city: string;
        line1: string;
        pincode: string;
    };
    timestamp: Time;
    items: Array<{
        productId: bigint;
        quantity: bigint;
    }>;
    phoneNumber: string;
    totalPrice: number;
    transactionId?: string;
}
export interface Product {
    id: bigint;
    featured: boolean;
    name: string;
    description: string;
    imageUrl: string;
    category: Category;
    price: number;
    stockAvailable: boolean;
}
export enum Category {
    vitaminsSupplements = "vitaminsSupplements",
    medicalEquipment = "medicalEquipment",
    personalCare = "personalCare",
    medicines = "medicines",
    firstAid = "firstAid"
}
export enum Variant_paymentConfirmed_awaitingVerification_rejected {
    paymentConfirmed = "paymentConfirmed",
    awaitingVerification = "awaitingVerification",
    rejected = "rejected"
}
export interface backendInterface {
    clearAllData(): Promise<void>;
    confirmPayment(orderId: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getConfirmedOrders(): Promise<Array<Order>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrdersByPhoneNumber(phoneNumber: string): Promise<Array<Order>>;
    getPendingPaymentOrders(): Promise<Array<Order>>;
    getProductById(id: bigint): Promise<Product | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    initialize(): Promise<void>;
    placeOrder(request: PlaceOrderRequest): Promise<PlaceOrderResponse>;
    rejectPayment(orderId: bigint): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    seedProducts(): Promise<void>;
    submitPaymentProof(orderId: bigint, transactionId: string): Promise<void>;
}
