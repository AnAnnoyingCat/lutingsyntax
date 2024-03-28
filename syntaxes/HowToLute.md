# NEW STYLE LUTINGS

The New Style Lutings offer a new and compressed form of writing Lutings. This guide will explain exactly how to write them and also includes tips on efficiency.

## 1. INITIALIZATION

In a first step you will need to fix several settings for your Luting. For this part I will use the song "Twinkle, Twinkle, Little Star" as an example.

### 1.1 BPM

First of all, the BPM is defined at the beginning of the luting. Notation is #lute BPM.  

BPM can be any Integer number. It is recommended to pick BPM equal to four times the BPM of the song you wish to play. The reason for that will be explained in section 1.2.3.  
Our example song is playing at 100 BPM so let's set BPM to 400.

> #lute 400

### 1.2 Line-Specific Settings

Lutings are made up of multiple different sequences of notes playing at the same time, called **Voice**. They will be discussed later, for now, let's assume there's only one **Voice** present. Before writing the Notes, Instrument, Octave, Default Note Duration, Volume and Panning direction need to be specified.

#### 1.2.1 Instrument

The **Instrument** (Soundfont) is set once per line and cannot be changed. The key-letter for Instrument is "i". As of today, there exist the following **Instruments**:

| Name | Abbreviation |
| ------ | ------ |
| Lute | il |
| Bass | ib |
| Flute | if |
| Keyboard | ik |
| Chiptune | ic |
| The Cat  | im |
| The Bean | it |
| Percussion | ip |
| Drumkit | id |

The Drumkit requires further explanation and will be discussed in section 2.2.  
For our example we want to choose the classic "Lute".

> #lute 400  
> il

#### 1.2.2 Octave

The key-letter for **Octave** is "o". **Octaves** range from o1 to o7. Writing "o" without a number makes the **Octave** default to 4.  
Writing ">" increases **Octave** by 1. Writing "<" decreases **Octave** by 1.  
It can be changed at any point in the **Voice**.  
For our example we want to start on the middle C, so **Octave** 4.

> #lute 400  
> ilo4

#### 1.2.3 Default Duration

The key-letter for **Default Duration** is "t". **Default Duration** can be any whole number or fraction (see section 2.1). It can be changed at any point in the **Voice**.  
When BPM is set to four times the original song BPM, t1 will be a sixteenth note, t2 will be an eigth note, t4 will be a quarter note and so on.  
In our example we only play quarter notes, thus we will set **Default Duration** to t4.

> #lute 100  
> ilo4t4

#### 1.2.4 Volume

The key-letter for **Volume** is "v". **Volume** can be 1, 2, ..., 9, being equivalent to 10%, 20%, ..., 90%. When just writing v without a number, **Volume** is set to 100%. It can be changed at any point in the **Voice**.  
For our example we want only have one **Voice** so we want full **Volume**, so just v.

> #lute 400  
> ilo4t4v

#### 1.2.5 Panning

The key-letter for **Panning** is "p". **Panning** ranges from 1 to 9, where p1 is all the way to the left, p9 is all the way to the right and p5 is right in the center. It can be changed at any point in the **Voice**.  
For our example we don't want any **Panning** going on so we set it to p5.

> #lute 400  
> ilo4t4vp5

#### 1.2.6 Default settings

That's quite a lot of glorp we have there for just one **Voice**! That's why the default settings exist. When a new **Voice** begins, all the aforementioned parameters are set to their default values, which are as follows:

| Setting | Default |
| ------ | ------ |
| Instrument | il / Lute |
| Octave | o4 / Middle C |
| Default Duration | t1 / Sixteenths |
| Volume | v / Full Volume |
| Panning | p5 / Right in the Center |

Using this we can instead write our Twinkle, Twinkle, Little Star like this:

> #lute 400  
> t4

Where all the other parameters are set to their defaults.

## 2. Notes

Now that we specified BPM and all the parameters for our new voice we can start adding some notes.

### 2.1 Notation

Notes consist of the following symbols:

- The Note itself being either c-b, always lowercase, meaning the respective notes, or r, meaning a pause.
- Optionally the symbol ' to denote that a Note is flat.
- Optionally the duration if it isn't the **Default Duration**.

Our example of Twinkle, Twinkle, Little Star would look like this:

> #lute 400  
> t4ccggaag8ffeeddc8

The duration of a Note can be any whole number or Fraction.

```md
Fractions:
The Duration of a Note or the Default Duration can also be a Fraction. Fractions are of the form a/b, where both a and b can be any integer number. If either a or b are emitted, they are assumed to be 1. Here are some examples so you can see the syntax:
```

Here are some examples to help make things clearer:

| Notation | Meaning | Remark |
| ------ | ------ | ------ |
| a | Note a, Duration Default | Your average note |
| d'3 | Note d flat, Duration 3 | We don't need to write 3/1 |
| e'/2 | Note e flat, duration 1/2 | We don't need to write 1/2 |
| d' | Note c sharp, duration default | Sharp isn't part of this notation |
| c/2 | a 32th Note | Assuming BPM = Song-BPM * 4 |
| c5/2 | The longer 8th Note in a swing rhythm | When making swing songs, consider making... |
| c3/2 | The shorter 8th Note in a swing rhythm | ... BPM twice as high to write c5 or c3 instead. |

### 2.2 The Drumkit

The Drumkit works slightly differently. Different specific notes in specific octaves have a specific sound. The sounds are as follows:
| Note | Sound |
| ------ | ------ |
| o0a | Kick |
| o1c | Low Tom |
| o1a | Mid Tom |
| o2c | High Tom |
| o2a | Rim |
| o3c | Snare |
| o3a | Clap |
| o4c | Closed High Hat |
| o4a | Open High Hat |
| o5c | Cymbal |
| o5a | Cowbell |
| o6c | Ding |

## 3. Definitions

In music, a lot of sections tend to repeat quite a lot or reappear at different points in the song. Instead of wasting characters on that, we can **Define** a section and name it a capital letter for later use.  
Any leter A-Z is legal for a name. The section to be **defined** is written in between Curly {} Brackets. Repeating a **defined** section multiple times is done by specifying the number of repetitions after the closing } Bracket, or after the name if already **defined**. Here's an example that'll make it more clear.  

>**Example**  
>I want to play the following:  
>**ababababcccabababab**  
>I could write:  
>**A{abababab}cccA**  
>This plays the section "abababab" and **Defines** it as A, which is referenced again shortly after.  
>Now also making use of repetition we get the following:  
>**A{ab}4cccA4**  
>This **defines** the section "ab' in A, repeats it 4 times, and then references it again shortly after also playing it 4 times.

## 4. Chords

Of course, there is also a way of writing chords. Chords are written in round () brackets. The duration of the entire chord can be specified afterwards.

>Chords are in ascending order. So (cecece) would be ce from o4, ce from o5 and ce from o6 at the same time in a chord. No need for \>.

## 5. Multiple Voices

You can have multiple **Voices** at the same time! simply separate them with a "|". Different **Voices** all start playing at exactly the same time.  
That's all of the syntax for now. If you like, in the next chapter I have included some tips and tricks. Other than that I wish you good luck and happy Luting!

## 6. Tips and Tricks

### 6.1 General Tips

- Twitch has a character limit of 500. To cheer, you need to write "Cheer1 " which is 7 characters. So your luting can have a maximum length of **493** characters.
- You can define as many simultaneous lines of notes as you like, but it always uses up a few characters per new line. Still, lots of room to be creative!
- If you accidentally pressed "Generate" on a luting that doesn't work, you'll need to reload the website. Remember that after refreshing you won't be able to undo previous changes using Ctrl+Z.
- I made an Extension for VS Code which offers Luting Syntax Highlighting, Automatic Optimization, Comments and a way to directly download your luting without visiting the website. Check it out [here](https://marketplace.visualstudio.com/items?itemName=AnAnnoyingCat.lutingsyntax).
- If you got any questions or need some help or pointers feel free to ask on the Blebs [discord](https://discord.gg/qT3AeNmh). In #art there is a thread for Lutings :)

### 6.2 Tips for saving space

- If you're using a lot of fractional note lengths, maybe a higher BPM could help save some space. Consider:  

  >#lute 100  
  >ilo4t1abcabca/2a/2a/2a/2abcabc  

  vs.

  >#lute 200  
  >ilo4t2abcabca1a1a1a1abcabc  
  
- If you're using a lot of flats, maybe defining them as their own section could save some space. Consider:

  >#lute 100  
  >ilo4t1b'b'b'b'b'b'b'b'  

  vs.

  >ilo4t1B{b'}BBBBBBB  

  (of course in this small example using repetition would save more space, but bear in mind this B can be used all over the song now!)
  
- Defined sections can also include octave changing symbols ><. For example if you use the expression **>c<** a lot, consider defining it as its own section.

- Section definitions can contain other section definitions. Get creative (or just automatically optimize it [here](https://marketplace.visualstudio.com/items?itemName=AnAnnoyingCat.lutingsyntax) ;)
  
Good luck with your Lutings! :)
