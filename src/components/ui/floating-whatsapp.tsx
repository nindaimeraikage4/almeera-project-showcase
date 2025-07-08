import { MessageSquare } from "lucide-react";

const FloatingWhatsApp = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "6285252108850";
    const message = "Hai kak, ada yang bisa saya bantu?";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-elegant transition-all duration-300 animate-pulse-soft hover:scale-110"
      aria-label="Chat WhatsApp"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  );
};

export default FloatingWhatsApp;