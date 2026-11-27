import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { CategoryPage } from './pages/CategoryPage';
import { EnquiryPage } from './pages/EnquiryPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductPage } from './pages/ProductPage';
import { SearchPage } from './pages/SearchPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categories/:slug', element: <CategoryPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'products/:id', element: <ProductPage /> },
      { path: 'products/:id/enquire', element: <EnquiryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
