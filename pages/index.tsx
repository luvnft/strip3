import type { NextPage } from "next";
import { loadStripe } from "@stripe/stripe-js";
import {
  ConnectWallet,
  useAddress,
  useLogin,
  useLogout,
  useUser,
} from "@thirdweb-dev/react";
import { useState } from "react";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const address = useAddress();
  const { logout } = useLogout();
  const { user } = useUser();
  const [authMessage, setAuthMessage] = useState("N/A");
  const [subscriptionMessage, setSubscriptionMessage] = useState("N/A");

  const checkout = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
    });
    const session = await res.json();
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error("Stripe publishable key not set");
    }

    const stripe = await loadStripe(publishableKey as string, {
      apiVersion: "2020-08-27",
    });
    await stripe?.redirectToCheckout({
      sessionId: session.id,
    });
  };

  const checkSubscription = async () => {
    const res = await fetch("/api/stripe/subscription", {
      method: "POST",
    });
    const message = await res.json();
    setSubscriptionMessage(message);
  };

  const authenticatedRequest = async () => {
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
      });

      const data = await response.json();
      setAuthMessage(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>💈 Barber Haircut NFT</h2>

      {user ? (
        <button className={styles.mainButton} onClick={() => logout()}>
          Logout
        </button>
      ) : (
        <ConnectWallet />
      )}

      <p>Connected Address: {address || "N/A"}</p>

      <h2>Authentication - Backend</h2>

      {address ? (
        <div>
          <button className={styles.mainButton} onClick={authenticatedRequest}>
            Authenticate
          </button>

          <p>Logged In Address: {user ? user.address : "N/A"}</p>
          <p>Authentication: {authMessage}</p>
        </div>
      ) : (
        <p>Connect your wallet to access authentication.</p>
      )}

      <h2>Payments - Stripe</h2>

      <button className={styles.mainButton} onClick={checkout}>
        Subscribe
      </button>
      <button
        className={styles.mainButton}
        onClick={checkSubscription}
        style={{ marginTop: "10px" }}
      >
        Check Subscription
      </button>
      <p>Subscription: {subscriptionMessage}</p>
    </div>
  );
};

export default Home;
