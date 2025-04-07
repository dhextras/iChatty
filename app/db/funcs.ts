import { supabase } from "./auth";

/**
 * Starts a new chat session and records its start time.
 *
 * @param {string} deviceId - The unique device identifier.
 * @returns {Promise<object|null>} The created chat session data or null on failure.
 */
export async function startChatSession(deviceId: string) {
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
 * Updates an existing chat session with an end time, summary, and mood score.
 *
 * @param {string} sessionId - The chat session identifier.
 * @param {string} summary - A summary of the chat session.
 * @param {number} mood_score - The mood score associated with the session.
 * @returns {Promise<object|null>} The updated session data or null on failure.
 *
 */
export async function updateChatSession(
  sessionId: string,
  summary: string,
  mood_score: number,
) {
  // FIXME: Also instead of calling the update every time just wait for like 30 min if there no other update call comes up we send it for that specific user if it comes we wait until there is no message for like net 30 min
  // every time new one comes we update the timer
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
    console.error("Error updating chat session:", error);
    return null;
  }

  return data;
}

/**
 * Saves a mood entry linked to a chat session.
 *
 * @param {string} deviceId - The unique device identifier.
 * @param {string} sessionId - The chat session identifier.
 * @param {number} moodScore - The recorded mood score.
 * @param {string} [note] - An optional note for the mood entry.
 * @returns {Promise<object|null>} The saved mood entry or null on failure.
 */
export async function saveMoodEntry(
  deviceId: string,
  sessionId: string,
  moodScore: number,
  note?: string,
) {
  const { data, error } = await supabase
    .from("mood_entries")
    .insert({
      device_id: deviceId,
      session_id: sessionId,
      mood_score: moodScore,
      note,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving mood entry:", error);
    return null;
  }

  return data;
}

/**
 * Registers a device by updating its last seen timestamp or creating a new record if it doesn’t exist.
 *
 * @param {string} deviceId - The unique device identifier.
 * @returns {Promise<object|null>} The device record or null on failure.
 *
 * @note If the device is not found, a new record is created instead of updating.
 */
export async function registerDevice(deviceId: string) {
  const { data: existingDevice, error: updateError } = await supabase
    .from("devices")
    .update({ last_seen: new Date().toISOString() })
    .match({ device_id: deviceId })
    .select("id")
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
      .select("id")
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
export async function setDeviceIdForRequest(deviceId: string) {
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
 * @returns {Promise<object|null>} The updated session data or null on failure.
 *
 */
export async function getChatSessions(deviceId: string) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select()
    .match({ device_id: deviceId });
  if (error) {
    console.error("Error getting chat sessions:", error);
    return null;
  }

  return data;
}
