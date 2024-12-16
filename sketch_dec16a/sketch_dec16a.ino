const int NUM_POTS = 3;
int analogPins[NUM_POTS] = {A0, A1, A2};

enum PotState {IDLE, MOVING, STOPPED};
PotState potStates[NUM_POTS];

int currentValues[NUM_POTS];    
int lastValues[NUM_POTS];       
int stableValues[NUM_POTS];    
int stableCount[NUM_POTS];  

const int stableCountThreshold = 10;  

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < NUM_POTS; i++) {
    int val = analogRead(analogPins[i]);
    currentValues[i] = val;
    lastValues[i] = val;
    stableValues[i] = val;
    potStates[i] = IDLE;
    stableCount[i] = 0;
  }
}

void loop() {
  bool anyStopped = false;

  for (int i = 0; i < NUM_POTS; i++) {
    int val = analogRead(analogPins[i]);
    currentValues[i] = val;

    if (currentValues[i] != lastValues[i]) {
      potStates[i] = MOVING;
      stableCount[i] = 0;
    } else {
      // Same reading as last time
      if (potStates[i] == MOVING) {
        stableCount[i]++;
        if (stableCount[i] >= stableCountThreshold) {
          potStates[i] = STOPPED;
          stableValues[i] = currentValues[i];
          anyStopped = true;
        }
      }
    }

    lastValues[i] = currentValues[i];
  }

  //send stable data after changing
  if (anyStopped) {
    Serial.print(stableValues[0]); Serial.print(" ");
    Serial.print(stableValues[1]); Serial.print(" ");
    Serial.println(stableValues[2]);
  }

  // Reset stopped pots to IDLE
  for (int i = 0; i < NUM_POTS; i++) {
    if (potStates[i] == STOPPED) {
      potStates[i] = IDLE;
    }
  }

  delay(2);
}
