import type { AppProps } from 'next/app';
import { AppThemeProvider } from '../context/ThemeContext';
import { Web3Provider } from '../context/Web3Context';
import Layout from '../components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppThemeProvider>
      <Web3Provider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </Web3Provider>
    </AppThemeProvider>
  );
}
