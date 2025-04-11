import { supabase } from "./auth";

import type { Device } from "~/types/index";
import type { ChatSession } from "~/types/chat";

const UPDATE_DELAY = 30 * 60 * 1000; // NOTE: Flushing time can be configure here

const pendingSessionUpdates = new Map<
  string,
  {
    summary: string;
    mood_score: number;
    timer: NodeJS.Timeout;
  }
>();

/**
 * Starts a new chat session and records its start time.
 *
 * @param {string} deviceId - The unique device identifier.
 * @returns {Promise<ChatSession|null>} The created chat session data or null on failure.
 */
export async function startChatSession(
  deviceId: string,
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      device_id: deviceId,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      mood_score: 50, // Start with neutral mode
      summary: "User Is just started the converstation", // NOTE: Configure both as needed later on
    })
    .select()
    .single();

  if (error) {
    console.error("Error starting chat session:", error);
    return null;
  }

  return data;
}

/**
 * Queue a chat session update that will be applied after a period of inactivity
 * @param sessionId The ID of the chat session to update
 * @param summary The chat summary to set
 * @param mood_score The mood score to set
 * @returns Promise that resolves to the updated chat session or null if error
 */
export async function updateChatSession(
  sessionId: string,
  summary: string,
  mood_score: number,
): Promise<void> {
  if (pendingSessionUpdates.has(sessionId)) {
    clearTimeout(pendingSessionUpdates.get(sessionId)!.timer);
  }

  const timer = setTimeout(async () => {
    console.log(`Flushing queued session: ${sessionId}`);
    await applySessionUpdate(sessionId);
  }, UPDATE_DELAY);

  pendingSessionUpdates.set(sessionId, {
    summary,
    mood_score,
    timer,
  });

  console.log(
    `Update queued for session ${sessionId}, will apply after ${UPDATE_DELAY / 1000 / 60} minutes of inactivity`,
  );
}

/**
 * Apply a pending update to the database
 * @param sessionId The ID of the chat session to update
 * @returns Promise that resolves to the updated chat session or null if error
 */
async function applySessionUpdate(
  sessionId: string,
): Promise<ChatSession | null> {
  if (!pendingSessionUpdates.has(sessionId)) {
    console.warn(`No pending update found for session ${sessionId}`);
    return null;
  }

  const { summary, mood_score } = pendingSessionUpdates.get(sessionId)!;

  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .update({
        end_time: new Date().toISOString(),
        summary,
        mood_score,
      })
      .match({ id: sessionId })
      .select()
      .single();

    if (error) {
      console.error(`Error updating chat session ${sessionId}:`, error);
      return null;
    }

    pendingSessionUpdates.delete(sessionId);
    return data;
  } catch (err) {
    console.error(`Exception updating chat session ${sessionId}:`, err);
    return null;
  }
}

/**
 * Registers a device by updating its last seen timestamp or creating a new record if it doesn’t exist.
 *
 * @param {string} deviceId - The unique device identifier.
 * @returns {Promise<Device|null>} The device record or null on failure.
 *
 * @note If the device is not found, a new record is created instead of updating.
 */
export async function registerDevice(deviceId: string): Promise<Device | null> {
  const { data: existingDevice, error: updateError } = await supabase
    .from("devices")
    .update({ last_seen: new Date().toISOString() })
    .match({ device_id: deviceId })
    .select("*")
    .single();

  // If the device doesn't exist, create it
  if (updateError && updateError.code === "PGRST116") {
    console.error(
      `Failed to update device ${deviceId} trying to create one:`,
      updateError,
    );
    const { data: newDevice, error: insertError } = await supabase
      .from("devices")
      .insert({ device_id: deviceId })
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to register device:", insertError);
      return null;
    }

    return newDevice;
  }

  if (updateError) {
    console.error("Failed to update device last_seen:", updateError);
    return null;
  }

  return existingDevice;
}

/**
 * Sets the device ID for the current request to enforce Row Level Security (RLS) policies.
 *
 * @param {string} deviceId - The unique device identifier.
 * @returns {Promise<boolean>} True if the operation was successful, otherwise false.
 */
export async function setDeviceIdForRequest(
  deviceId: string,
): Promise<boolean> {
  try {
    await supabase.rpc("set_device_id_claim", { device_id: deviceId });
    return true;
  } catch (error) {
    console.error("Failed to set device ID claim:", error);
    return false;
  }
}

/**
 * Get All the Session Data for the specified user
 *
 * @param {string} deviceId - The unique device identifier.
 * @returns {Promise<ChatSession[]|null>} The updated session data or null on failure.
 *
 */
export async function getChatSessions(
  deviceId: string,
): Promise<ChatSession[] | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .match({ device_id: deviceId });
  if (error) {
    console.error("Error getting chat sessions:", error);
    return null;
  }

  return data;
}
