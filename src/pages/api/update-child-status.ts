import { sanityClient } from "sanity:client";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ error: "Invalid content type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await request.json();

    const { childId, status } = data;
    await sanityClient
      .withConfig({ token: import.meta.env.SANITY_WRITE_TOKEN })
      .patch(childId)
      .set({ status: status })
      .commit();

    return new Response(
      JSON.stringify({
        message: "Successfully updated child status",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating child status:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update child status",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
