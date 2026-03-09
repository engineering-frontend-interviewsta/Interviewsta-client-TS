import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ROUTES } from '../../constants/routerConstants';

const companyLinks = [
  { name: 'About Us', link: ROUTES.ABOUT },
  { name: 'Careers', link: ROUTES.ABOUT },
  { name: 'Contact', link: ROUTES.CONTACT },
];

const productLinks = [
  { name: 'Video Interviews', link: ROUTES.VIDEO_INTERVIEWS_LANDING },
  { name: 'Resume Analysis', link: ROUTES.RESUME_LANDING },
  { name: 'Dashboard', link: ROUTES.LANDING_DASHBOARD },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-1">
            <span className="text-lg font-semibold">Interviewsta</span>
            <p className="text-neutral-400 mt-4 mb-6 text-sm leading-relaxed">
              Empowering professionals worldwide with AI-powered interview preparation tools and
              personalized coaching.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((item) => (
                <li key={item.link + item.name}>
                  <Link to={item.link} className="text-neutral-400 hover:text-white text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item.link + item.name}>
                  <Link to={item.link} className="text-neutral-400 hover:text-white text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@interviewsta.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 7340899959</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Bangalore, KA</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">© {new Date().getFullYear()} Interviewsta. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to={ROUTES.PRIVACY_POLICY} className="text-neutral-500 hover:text-white text-sm">
              Privacy
            </Link>
            <Link to={ROUTES.TERMS_OF_SERVICE} className="text-neutral-500 hover:text-white text-sm">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
