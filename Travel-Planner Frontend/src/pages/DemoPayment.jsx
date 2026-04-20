import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

const PENDING_BOOKING_STORAGE_KEY = 'pendingTourBookingCheckout';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const paymentMethodLabels = {
  CARD: 'Card',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
};

const transportLabels = {
  suv: 'Luxury SUV',
  van: 'Comfort Van',
  bus: 'Shuttle Bus',
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const readPendingBooking = (stateValue) => {
  if (stateValue) {
    return stateValue;
  }

  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  const raw = window.sessionStorage.getItem(PENDING_BOOKING_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    window.sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
    return null;
  }
};

const DemoPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankReference, setBankReference] = useState('');

  const pendingBooking = useMemo(
    () => readPendingBooking(location.state?.pendingBooking),
    [location.state]
  );

  if (!pendingBooking) {
    return (
      <div className="page-shell min-h-screen pt-32 pb-16">
        <div className="max-w-xl mx-auto glass-card p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">No Pending Booking Found</h1>
          <p className="text-sm text-gray-500 mt-3">
            Start from a tour page, fill traveler details, then continue to payment.
          </p>
          <Link
            to="/tours"
            className="inline-block mt-6 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  const travelersCount = Array.isArray(pendingBooking.travelers)
    ? pendingBooking.travelers.length
    : Math.max(1, Number(pendingBooking.travelersCount || 1));

  const totalAmount = Number(pendingBooking.totalAmount || 0);

  const validatePaymentInput = () => {
    if (paymentMethod === 'CARD') {
      if (!cardHolderName.trim() || !cardNumber.trim()) {
        return 'Card holder name and card number are required.';
      }
    }

    if (paymentMethod === 'UPI' && !upiId.trim()) {
      return 'UPI ID is required.';
    }

    return null;
  };

  const handlePayNow = async () => {
    if (!user || user.role !== 'USER' || !token) {
      navigate('/login');
      return;
    }

    const inputError = validatePaymentInput();
    if (inputError) {
      setErrorMessage(inputError);
      setMessage('');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingRecordId: pendingBooking.bookingRecordId,
          method: paymentMethod,
          cardHolderName: paymentMethod === 'CARD' ? cardHolderName : null,
          cardNumber: paymentMethod === 'CARD' ? cardNumber : null,
          upiId: paymentMethod === 'UPI' ? upiId : null,
          bankReference: paymentMethod === 'BANK_TRANSFER' ? bankReference : null,
        }),
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setErrorMessage(payload?.message || 'Unable to process payment.');
        return;
      }

      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
      }

      setMessage(`Payment successful. Booking ${pendingBooking.id} is now pending admin approval.`);
      window.setTimeout(() => {
        navigate('/user/dashboard/my-trips');
      }, 1000);
    } catch {
      setErrorMessage('Unable to connect to backend server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const showCardFields = paymentMethod === 'CARD';
  const showUpiField = paymentMethod === 'UPI';
  const showBankReferenceField = paymentMethod === 'BANK_TRANSFER';

  const backToTourPath = `/tours/${String(pendingBooking.destination || '')
    .toLowerCase()
    .replace(/\s/g, '-')}`;

  return (
    <div className="page-shell min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6">
            <h1 className="text-2xl font-bold text-gray-800">Demo Payment</h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete payment to submit your booking request.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Payment Method</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white/80"
                >
                  {Object.entries(paymentMethodLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {showCardFields ? (
                <>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Card Holder Name</span>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(event) => setCardHolderName(event.target.value)}
                      placeholder="Full Name"
                      className="mt-2 w-full border border-gray-200/70 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Card Number</span>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="mt-2 w-full border border-gray-200/70 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>
                </>
              ) : null}

              {showUpiField ? (
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">UPI ID</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="example@upi"
                    className="mt-2 w-full border border-gray-200/70 rounded-lg px-3 py-2 text-sm"
                  />
                </label>
              ) : null}

              {showBankReferenceField ? (
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Bank Reference (Optional)</span>
                  <input
                    type="text"
                    value={bankReference}
                    onChange={(event) => setBankReference(event.target.value)}
                    placeholder="Reference number"
                    className="mt-2 w-full border border-gray-200/70 rounded-lg px-3 py-2 text-sm"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Reference Email</span>
                <input
                  type="email"
                  value={pendingBooking.travelerEmail || ''}
                  readOnly
                  className="mt-2 w-full border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white/70"
                />
              </label>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {isProcessing ? 'Processing...' : `Pay ${formatAmount(totalAmount, pendingBooking.currency || 'INR')}`}
              </button>

              {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
              {message ? <p className="text-sm text-green-700">{message}</p> : null}
            </div>
          </div>

          <div className="glass-card p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-800">Booking Summary</h2>
            <div className="space-y-2 mt-4 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Booking ID:</span> {pendingBooking.id}
              </p>
              <p>
                <span className="font-medium text-gray-800">Tour:</span> {pendingBooking.destination},{' '}
                {pendingBooking.country}
              </p>
              <p>
                <span className="font-medium text-gray-800">Date:</span>{' '}
                {formatDate(pendingBooking.travelDate)}
              </p>
              <p>
                <span className="font-medium text-gray-800">Travelers:</span> {travelersCount}
              </p>
              <p>
                <span className="font-medium text-gray-800">Transport:</span>{' '}
                {transportLabels[pendingBooking.transportation] || pendingBooking.transportation}
              </p>
              <p className="pt-2 border-t border-gray-100">
                <span className="font-medium text-gray-800">Amount:</span>{' '}
                <span className="font-bold text-gray-900">
                  {formatAmount(totalAmount, pendingBooking.currency || 'INR')}
                </span>
              </p>
            </div>

            <Link
              to={backToTourPath}
              className="inline-block mt-5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Tour
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPayment;
