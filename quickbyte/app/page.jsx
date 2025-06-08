'use client';

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from '../lib/supabaseClient';

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <main className={styles.main}>
          <h1>Welcome to QuickByte!</h1>
          <p>Please sign up or log in to continue.</p>
          <div className={styles.buttons}>
            <Link href="/signup">
              <button className={styles.button}>Sign Up</button>
            </Link>
            <Link href="/login">
              <button className={styles.button}>Log In</button>
            </Link>

            {}
            <Link href="/page2">
              <button className={styles.button}>Add Recipe</button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}



