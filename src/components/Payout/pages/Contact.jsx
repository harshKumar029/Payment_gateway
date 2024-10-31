import React from "react";

export default function Contact() {
  function createContact(formData) {
    // console.log(formData);
  }
  return (
    <form action={createContact}>
      <h1>Add New Contact</h1>
      <input label="Contact Name*" name="query" />
      <button type="submit">Search</button>
    </form>
  );
};