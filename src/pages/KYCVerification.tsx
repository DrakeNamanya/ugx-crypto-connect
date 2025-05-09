
import React, { useState, useRef } from 'react';
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
import { Camera, Upload } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import Tesseract from 'tesseract.js';

// Sample data for districts in Uganda
const ugandaDistricts = [
  "Kampala", "Wakiso", "Mukono", "Jinja", "Gulu", 
  "Mbarara", "Mbale", "Masaka", "Arua", "Lira",
  "Tororo", "Soroti", "Fort Portal", "Hoima", "Kabale"
];

// Expanded sub-counties data for all districts
const subCounties = {
  "Kampala": ["Central", "Kawempe", "Makindye", "Nakawa", "Rubaga"],
  "Wakiso": ["Nansana", "Kira", "Entebbe", "Makindye-Ssabagabo", "Katabi"],
  "Mukono": ["Mukono Central", "Goma", "Kyampisi", "Nama", "Ntenjeru"],
  "Jinja": ["Jinja North", "Jinja South", "Budondo", "Butagaya", "Mafubira"],
  "Gulu": ["Gulu City", "Pece-Laroo", "Bardege-Layibi", "Palaro", "Patiko"],
  "Mbarara": ["Mbarara City", "Nyamitanga", "Kakoba", "Kamukuzi", "Biharwe"],
  "Mbale": ["Mbale City", "Industrial", "Northern", "Wanale", "Nyondo"],
  "Masaka": ["Masaka City", "Kimaanya-Kyabakuza", "Nyendo-Mukungwe", "Katwe-Butego", "Kimanya-Kabonera"],
  "Arua": ["Arua City", "Ayivu", "River Oli", "Adumi", "Pajulu"],
  "Lira": ["Lira City", "Adyel", "Ojwina", "Railways", "Central"],
  "Tororo": ["Tororo Municipality", "Eastern", "Western", "Merikit", "Molo"],
  "Soroti": ["Soroti City", "Eastern", "Western", "Northern", "Southern"],
  "Fort Portal": ["Fort Portal City", "East", "West", "South", "Central"],
  "Hoima": ["Hoima City", "Busiisi", "Mparo", "Bujumbura", "Kahoora"],
  "Kabale": ["Kabale Municipality", "Northern", "Southern", "Central", "Kamuganguzi"]
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
});

type KYCFormValues = z.infer<typeof formSchema>;

const KYCVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null);
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const form = useForm<KYCFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: '',
      subCounty: '',
      village: '',
      sourceOfIncome: '',
    },
  });

  const handleDistrictChange = (district: string) => {
    console.log("District selected:", district);
    setSelectedDistrict(district);
    form.setValue('subCounty', '');
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    const result = await Tesseract.recognize(file);
    return result.data.text;
  };

  const verifyNameMatch = async (file: File) => {
    try {
      const extractedText = await extractTextFromImage(file);
      const registeredName = user?.user_metadata?.full_name?.toLowerCase() || '';
      const extractedTextLower = extractedText.toLowerCase();
      
      if (!extractedTextLower.includes(registeredName)) {
        toast.error('The name on the ID does not match your registered name');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error verifying name:', error);
      toast.error('Error verifying ID. Please try again.');
      return false;
    }
  };

  const handleFrontIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (await verifyNameMatch(file)) {
        form.setValue('nationalIdFront', file);
        setFrontIdPreview(URL.createObjectURL(file));
      } else {
        e.target.value = '';
      }
    }
  };

  const handleBackIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('nationalIdBack', file);
      setBackIdPreview(URL.createObjectURL(file));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          facingMode: "user"
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setFaceImage(imageData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const retakePhoto = () => {
    setFaceImage(null);
    startCamera();
  };

  const onSubmit = async (values: KYCFormValues) => {
    if (!faceImage) {
      toast.error('Please capture your face photo');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('district', values.district);
      formData.append('subCounty', values.subCounty);
      formData.append('village', values.village);
      formData.append('sourceOfIncome', values.sourceOfIncome);
      formData.append('nationalIdFront', values.nationalIdFront);
      formData.append('nationalIdBack', values.nationalIdBack);
      formData.append('faceImage', faceImage);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('KYC information submitted successfully!');
      toast.info('Your information is being reviewed. This process may take 1-2 business days.');
      
      localStorage.setItem('kycSubmitted', 'true');
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
                            value={field.value}
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
                    
                    {/* Financial Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Financial Information</h3>
                      <FormField
                        control={form.control}
                        name="sourceOfIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source of Income</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your source of income" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ID Upload Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">National ID Upload</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Front ID Upload */}
                        <div>
                          <FormLabel>Front of National ID</FormLabel>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                                type="file" 
                                className="hidden" 
                                onChange={handleFrontIdChange}
                                accept="image/*"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Back ID Upload */}
                        <div>
                          <FormLabel>Back of National ID</FormLabel>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                                type="file" 
                                className="hidden" 
                                onChange={handleBackIdChange}
                                accept="image/*"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Face Verification Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Face Verification</h3>
                      <p className="text-sm text-gray-500">
                        Please take a clear photo of your face looking directly at the camera
                      </p>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex flex-col items-center space-y-4">
                          {/* Camera Preview */}
                          {isCameraActive && (
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full max-w-md rounded-lg"
                            />
                          )}
                          
                          {/* Captured Image Preview */}
                          {faceImage && (
                            <img 
                              src={faceImage}
                              alt="Captured face"
                              className="w-full max-w-md rounded-lg"
                            />
                          )}
                          
                          {/* Hidden Canvas for Capture */}
                          <canvas 
                            ref={canvasRef}
                            width="640"
                            height="480"
                            className="hidden"
                          />
                          
                          {/* Camera Controls */}
                          <div className="flex space-x-4">
                            {!isCameraActive && !faceImage && (
                              <Button 
                                type="button"
                                onClick={startCamera}
                                className="flex items-center gap-2"
                              >
                                <Camera className="w-4 h-4" />
                                Start Camera
                              </Button>
                            )}
                            
                            {isCameraActive && (
                              <Button 
                                type="button"
                                onClick={captureImage}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Capture Photo
                              </Button>
                            )}
                            
                            {faceImage && (
                              <Button 
                                type="button"
                                onClick={retakePhoto}
                                variant="outline"
                              >
                                Retake Photo
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !faceImage}
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
