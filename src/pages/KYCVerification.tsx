
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Upload } from 'lucide-react';

// Sample data for districts in Uganda
const ugandaDistricts = [
  "Kampala", "Wakiso", "Mukono", "Jinja", "Gulu", 
  "Mbarara", "Mbale", "Masaka", "Arua", "Lira",
  "Tororo", "Soroti", "Fort Portal", "Hoima", "Kabale"
];

// Sample data for sub-counties (would be dynamic in production)
const subCounties: Record<string, string[]> = {
  "Kampala": ["Central", "Kawempe", "Makindye", "Nakawa", "Rubaga"],
  "Wakiso": ["Nansana", "Entebbe", "Kira", "Makindye-Ssabagabo", "Kasangati"],
  "Mukono": ["Mukono Central", "Goma", "Nakisunga", "Kyampisi", "Nama"],
  "Jinja": ["Jinja Central", "Bugembe", "Mafubira", "Budondo", "Busedde"],
  "Gulu": ["Bardege", "Laroo", "Layibi", "Pece", "Unyama"],
  // More would be added in production
};

const formSchema = z.object({
  district: z.string({
    required_error: "Please select a district",
  }),
  subCounty: z.string({
    required_error: "Please select a sub-county",
  }),
  village: z.string().min(2, {
    message: "Village name must be at least 2 characters",
  }),
  sourceOfIncome: z.string().min(5, {
    message: "Please provide a valid source of income",
  }),
  nationalIdFront: z.instanceof(File, {
    message: "Front of National ID is required",
  }).refine((file) => file.size <= 5000000, {
    message: "File size must be less than 5MB",
  }),
  nationalIdBack: z.instanceof(File, {
    message: "Back of National ID is required",
  }).refine((file) => file.size <= 5000000, {
    message: "File size must be less than 5MB",
  }),
  // Video verification is handled separately
});

type KYCFormValues = z.infer<typeof formSchema>;

const KYCVerification = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null);
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null);

  const form = useForm<KYCFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: '',
      subCounty: '',
      village: '',
      sourceOfIncome: '',
    },
  });

  // Handle district change to update sub-counties
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    form.setValue('subCounty', ''); // Reset sub-county when district changes
  };

  // Handle file selection for ID front
  const handleFrontIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('nationalIdFront', file);
      setFrontIdPreview(URL.createObjectURL(file));
    }
  };

  // Handle file selection for ID back
  const handleBackIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('nationalIdBack', file);
      setBackIdPreview(URL.createObjectURL(file));
    }
  };

  // Start video recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setRecordingState('recorded');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setRecordingState('recording');
      
      // Stop recording after 15 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 15000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions and try again.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  // Submit the form
  const onSubmit = async (values: KYCFormValues) => {
    if (!videoBlob) {
      toast.error('Please record a verification video');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would normally send the data to your backend
      // For demonstration purposes, we'll simulate a successful submission
      
      // Create FormData to send files
      const formData = new FormData();
      formData.append('district', values.district);
      formData.append('subCounty', values.subCounty);
      formData.append('village', values.village);
      formData.append('sourceOfIncome', values.sourceOfIncome);
      formData.append('nationalIdFront', values.nationalIdFront);
      formData.append('nationalIdBack', values.nationalIdBack);
      formData.append('verificationVideo', videoBlob);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('KYC data would be sent:', {
        ...values,
        videoRecorded: true
      });
      
      toast.success('KYC information submitted successfully!');
      toast.info('Your information is being reviewed. This process may take 1-2 business days.');
      
      // In a real scenario, you would update the user's status in your database
      localStorage.setItem('kycSubmitted', 'true');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error('Failed to submit KYC information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Identity Verification</h1>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          To access full features and higher transaction limits, please complete the verification process. 
          This helps us comply with regulations and protect your account.
        </p>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Know Your Customer (KYC) Information</CardTitle>
              <CardDescription>
                Please provide accurate information as it appears on your ID document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Address Information */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-medium">Address Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleDistrictChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a district" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ugandaDistricts.map((district) => (
                                  <SelectItem key={district} value={district}>
                                    {district}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subCounty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-County</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!selectedDistrict}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedDistrict ? "Select a sub-county" : "Select a district first"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedDistrict && subCounties[selectedDistrict]?.map((subCounty) => (
                                  <SelectItem key={subCounty} value={subCounty}>
                                    {subCounty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="village"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Village/Zone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your village or zone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-medium">Financial Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="sourceOfIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source of Income</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your source of income (e.g., Employment, Business, etc.)" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-medium">National ID Upload</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel htmlFor="nationalIdFront">Front of National ID</FormLabel>
                          <div className="mt-2">
                            <label htmlFor="nationalIdFront" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              {frontIdPreview ? (
                                <img 
                                  src={frontIdPreview} 
                                  alt="ID Front Preview" 
                                  className="h-full object-contain" 
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="mb-2 text-gray-500" />
                                  <p className="text-sm text-gray-500">Click to upload front of ID</p>
                                </div>
                              )}
                              <input 
                                id="nationalIdFront" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFrontIdChange}
                              />
                            </label>
                          </div>
                          {form.formState.errors.nationalIdFront && (
                            <p className="text-sm font-medium text-destructive mt-2">
                              {form.formState.errors.nationalIdFront.message?.toString()}
                            </p>
                          )}
                        </div>

                        <div>
                          <FormLabel htmlFor="nationalIdBack">Back of National ID</FormLabel>
                          <div className="mt-2">
                            <label htmlFor="nationalIdBack" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              {backIdPreview ? (
                                <img 
                                  src={backIdPreview} 
                                  alt="ID Back Preview" 
                                  className="h-full object-contain" 
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="mb-2 text-gray-500" />
                                  <p className="text-sm text-gray-500">Click to upload back of ID</p>
                                </div>
                              )}
                              <input 
                                id="nationalIdBack" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleBackIdChange}
                              />
                            </label>
                          </div>
                          {form.formState.errors.nationalIdBack && (
                            <p className="text-sm font-medium text-destructive mt-2">
                              {form.formState.errors.nationalIdBack.message?.toString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-medium">Video Verification</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Please record a short video of yourself (15 seconds max) where you:
                        <br />1. Look directly at the camera
                        <br />2. Smile
                        <br />3. Turn your head slightly left and right
                      </p>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex flex-col items-center space-y-4">
                          {recordingState === 'recorded' && videoBlob && (
                            <video 
                              src={URL.createObjectURL(videoBlob)} 
                              controls 
                              className="w-full max-h-64 rounded"
                            />
                          )}
                          
                          {recordingState === 'recording' && (
                            <div className="w-full h-64 bg-gray-900 flex items-center justify-center rounded relative">
                              <div className="absolute top-2 right-2 flex items-center">
                                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                                <span className="text-white text-sm">Recording...</span>
                              </div>
                              <Video className="h-16 w-16 text-white opacity-50" />
                            </div>
                          )}
                          
                          <div className="flex space-x-4">
                            {recordingState === 'idle' && (
                              <Button 
                                type="button"
                                onClick={startRecording}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Start Recording
                              </Button>
                            )}
                            
                            {recordingState === 'recording' && (
                              <Button 
                                type="button"
                                onClick={stopRecording}
                                variant="destructive"
                              >
                                Stop Recording
                              </Button>
                            )}
                            
                            {recordingState === 'recorded' && (
                              <Button 
                                type="button"
                                onClick={() => {
                                  setVideoBlob(null);
                                  setRecordingState('idle');
                                }}
                                variant="outline"
                              >
                                Record Again
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || recordingState !== 'recorded'}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default KYCVerification;
