export default function Footer() {
  return (
    <footer className="bg-white border-t border-ink-100 mt-16">
      <div className="container-app py-8 text-sm text-ink-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Shopwave. All rights reserved.</p>
        <p>Secure payments powered by Razorpay</p>
      </div>
    </footer>
  );
}
