import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:support@interviewsta.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData(initialFormData);
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
      />
      <input
        type="text"
        placeholder="Subject"
        value={formData.subject}
        onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
      />
      <textarea
        placeholder="Message"
        rows={4}
        value={formData.message}
        onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm resize-none"
      />
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm"
      >
        {submitted ? 'Opening mail…' : 'Send message'}
      </button>
    </form>
  );
}
