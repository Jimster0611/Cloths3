import { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, Text, ScrollView, Image, Pressable, Modal } from 'react-native';

const BACKEND_URL = 'http://192.168.5.114:3001';

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [displayedReply, setDisplayedReply] = useState('');
  const [images, setImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const intervalRef = useRef(null);

  async function sendMessage() {
    setLoading(true);
    setDisplayedReply('');
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setReply(data.reply);
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
      setReply('Error reaching server');
    }
    setLoading(false);
  }

  // Typewriter effect for reply text
  useEffect(() => {
    if (!reply) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayedReply(reply.slice(0, i));
      if (i >= reply.length) {
        clearInterval(intervalRef.current);
      }
    }, 20);

    return () => clearInterval(intervalRef.current);
  }, [reply]);

  // Cycling dots while loading
  useEffect(() => {
    if (!loading) {
      setDots('');
      return;
    }

    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(dotInterval);
  }, [loading]);

  // Reveal images one by one
  useEffect(() => {
    if (images.length === 0) {
      setVisibleCount(0);
      return;
    }

    setVisibleCount(0);
    let count = 0;
    const imgInterval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= images.length) {
        clearInterval(imgInterval);
      }
    }, 300);

    return () => clearInterval(imgInterval);
  }, [images]);

  return (
    <ScrollView style={{ padding: 20, marginTop: 50 }}>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Ask for a style idea..."
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Button title={loading ? `Sending${dots}` : 'Send'} onPress={sendMessage} disabled={loading} />
      {displayedReply ? <Text style={{ marginTop: 20 }}>{displayedReply}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 10 }}>
        {images.slice(0, visibleCount).map((img, i) => (
          <Pressable key={i} onPress={() => setSelectedImage(img.url)}>
            <Image
              source={{ uri: img.url }}
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
          </Pressable>
        ))}
      </View>

      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{ uri: selectedImage }}
            style={{ width: '90%', height: '70%' }}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </ScrollView>
  );
}9