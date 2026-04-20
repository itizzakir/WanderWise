import React, { useMemo, useState } from 'react';
import { MessageSquareHeart, Star, ThumbsUp } from 'lucide-react';

const starterReviews = [
  {
    id: 'r-1',
    name: 'Ava M.',
    destination: 'Iceland Northern Lights',
    rating: 5,
    comment: 'Everything was organized well, and our guide was excellent.',
  },
  {
    id: 'r-2',
    name: 'Noah R.',
    destination: 'Bali Explorer',
    rating: 4,
    comment: 'Great value for money and smooth support throughout the trip.',
  },
  {
    id: 'r-3',
    name: 'Sophia T.',
    destination: 'Swiss Alps',
    rating: 5,
    comment: 'Amazing itinerary and beautiful stays. Highly recommended.',
  },
];

const Review = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    tripName: '',
    rating: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [reviews, setReviews] = useState(starterReviews);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const setField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      tripName: formData.tripName.trim(),
      comment: formData.comment.trim(),
      rating: formData.rating,
    };

    if (!payload.fullName || !payload.email || !payload.comment || payload.rating < 1) {
      setSubmitError('Please add your name, email, rating, and review before submitting.');
      setSubmitMessage('');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      const newReview = {
        id: `r-${Date.now()}`,
        name: payload.fullName,
        destination: payload.tripName || 'WanderWise Trip',
        rating: payload.rating,
        comment: payload.comment,
      };

      setReviews((current) => [newReview, ...current].slice(0, 6));
      setSubmitMessage('Thanks for your review. We appreciate your feedback.');
      setFormData({
        fullName: '',
        email: '',
        tripName: '',
        rating: 0,
        comment: '',
      });
    } catch {
      setSubmitError('Unable to submit your review right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell pt-32 pb-20">
      <section className="page-container max-w-[1240px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <article className="glass-card p-6 md:p-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
              <MessageSquareHeart size={16} />
              Traveler Feedback
            </div>
            <h1 className="text-4xl md:text-5xl font-primary font-bold text-primary mt-4">
              Give Us A Review
            </h1>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Tell us about your experience with WanderWise. Your feedback helps us improve
              destination planning, support quality, and booking flow.
            </p>

            <div className="mt-8 rounded-xl border border-white/70 bg-white/80 p-5">
              <p className="text-sm text-gray-500">Average Rating</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={star <= Math.round(Number(averageRating)) ? 'fill-yellow-500' : ''}
                    />
                  ))}
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {averageRating} / 5
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Based on {reviews.length} recent traveler reviews
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-white/70 rounded-xl bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-800">{review.name}</p>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={`${review.id}-${star}`}
                          size={16}
                          className={star <= review.rating ? 'fill-yellow-500' : ''}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{review.destination}</p>
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-primary font-semibold text-gray-900">
              Share Your Experience
            </h2>
            <p className="text-gray-600 mt-2">
              Fields marked by validation are required to submit your review.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  placeholder="Jane Traveler"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Name (optional)
                </label>
                <input
                  id="tripName"
                  type="text"
                  value={formData.tripName}
                  onChange={(event) => setField('tripName', event.target.value)}
                  placeholder="Bali Explorer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Rating</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setField('rating', value)}
                      aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                      className="text-yellow-500 transition-transform hover:scale-110"
                    >
                      <Star size={28} className={value <= formData.rating ? 'fill-yellow-500' : ''} />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {formData.rating > 0 ? `${formData.rating} / 5` : 'Select rating'}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="reviewComment"
                  rows="5"
                  value={formData.comment}
                  onChange={(event) => setField('comment', event.target.value)}
                  placeholder="Share what you liked and what we can improve."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
              {submitMessage ? (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <ThumbsUp size={16} />
                  {submitMessage}
                </p>
              ) : null}
            </form>
          </article>
        </div>
      </section>
    </div>
  );
};

export default Review;
