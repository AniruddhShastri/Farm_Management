# Bio Gas and Solar Changes - March 3rd

## What Was Added?
1. **Hybrid RES Calculator Math**: Extracted the math logic from the original MATLAB document (`Bio gas kartas.rtf`) into JavaScript.
   - Calculates the **Amount of Methane** produced based on cattle type (Dairy, Beef, Feedlot) or direct biomass input.
   - Calculates the **Power Output (kWh)** of that methane using the constant multiplier `(Methane * 22626 * 0.0002973071 * 0.35)`.
   
2. **Dashboard Controls**: Added new selections in the left sidebar under a new section "Hybrid RES Calculator".
   - You can select Cattle Manure Type.
   - You can enter extra Biomass in tons per day.
   - You can input your manual Daily Load Demand in kWh.
   - You can decide what to do if biogas falls short ("Add more biomass" or "Use Diesel Generator").

3. **New Visual Dashboard Section**: Created a new UI component called **Hybrid RES Calculator (Daily Balance)** perfectly styled to fit with the rest of your green-themed layout. 
   - It reads your inputs in real time.
   - It compares your generated **Solar Power** (broken down daily) against your manual **Load Demand**.
   - If solar isn't enough, it subtracts from your **Biogas Power potential**.
   - It alerts you with dynamic messages such as "Biomass Insufficient" (with an exact calculation of extra biomass needed) or "Biogas Sufficient" (in clean green formatting) just like your original calculator.

## How Do Biological & Solar Values Interact?
- **Solar Dominance**: If your daily average solar energy meets your load, the panel stays green and says no biogas generator connection is necessary.
- **Biogas Compensation**: If solar falls short, the calculator immediately checks how much Methane/Biogas is generated from your cow count or manual biomass entry.
- **Deficit**: If the remaining biogas is still not enough, the card turns red/yellow and provides exact numbers to bridge the gap using more biomass or a diesel generator.
