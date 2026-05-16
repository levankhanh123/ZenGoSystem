import axiosInstance from './axiosConfig';

export default class ApiService {

  // ================= AUTH =================
  static async login(data) {
    const res = await axiosInstance.post('/login', data);
    return res.data;
  }

  static async register(data) {
    const res = await axiosInstance.post('/register', data);
    return res.data;
  }

  // ================= CATEGORY =================
  static async getCategories() {
    const res = await axiosInstance.get('/categories/tree');
    return res.data;
  }

  static async getHomeCategories() {
    const res = await axiosInstance.get('/categories');
    return res.data;
  }

  static async getCategoryDetail(slug) {
    const res = await axiosInstance.get(`/categories/${slug}`);
    return res.data;
  }

  // ================= PRODUCT =================
  static async getProducts(params = {}) {
    const res = await axiosInstance.get('/products', { params });
    return res.data;
  }

  static async getProductDetail(slug) {
    const res = await axiosInstance.get(`/products/${slug}`);
    return res.data;
  }

  static async getProductById(id) {
    const res = await axiosInstance.get(`/products/${id}/detail`);
    return res.data;
  }

  static async getTopProducts() {
    const res = await axiosInstance.get('/products/top-selling');
    return res.data;
  }

  // ================= SHOP =================
  static async getShops(params = {}) {
    const res = await axiosInstance.get('/shops', { params });
    return res.data;
  }

  static async getTopShops() {
    const res = await axiosInstance.get('/shops/top');
    return res.data;
  }

  static async getShopDetail(id, params = {}) {
    const res = await axiosInstance.get(`/shops/${id}`, { params });
    return res.data;
  }

  // ================= VOUCHER =================
  static async getVouchers(params = {}) {
    const res = await axiosInstance.get('/vouchers', { params });
    return res.data;
  }

  static async collectVoucher(voucherId) {
    const res = await axiosInstance.post('/vouchers/collect', { voucher_id: voucherId });
    return res.data;
  }

  // ================= REVIEWS =================
  static async getReviews(productId) {
    const res = await axiosInstance.get(`/reviews/product/${productId}`);
    return res.data;
  }

  static async submitReview(data) {
    const res = await axiosInstance.post('/reviews', data);
    return res.data;
  }

  // ================= ACCOUNT =================
  static async getProfile() {
    const res = await axiosInstance.get('/account/profile');
    return res.data;
  }

  static async getOrders() {
    const res = await axiosInstance.get('/account/orders');
    return res.data;
  }

  // ================= CART =================
  static async getCart() {
    const res = await axiosInstance.get('/cart');
    return res.data;
  }

  static async addToCart(data) {
    const res = await axiosInstance.post('/cart/add', data);
    return res.data;
  }

  static async updateCartItem(id, data) {
    const res = await axiosInstance.put(`/cart/item/${id}`, data);
    return res.data;
  }

  static async removeCartItem(id) {
    const res = await axiosInstance.delete(`/cart/item/${id}`);
    return res.data;
  }

  static async clearCart() {
    const res = await axiosInstance.delete('/cart/clear');
    return res.data;
  }
}