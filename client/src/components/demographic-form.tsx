import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParticipantInfo } from "@shared/schema";
import { useEffect } from "react";

interface DemographicFormProps {
  participantInfo: ParticipantInfo;
  onUpdate: (info: ParticipantInfo) => void;
}

export default function DemographicForm({ participantInfo, onUpdate }: DemographicFormProps) {
  
  useEffect(() => {
    // Save to localStorage whenever participantInfo changes
    localStorage.setItem('participantInfo', JSON.stringify(participantInfo));
  }, [participantInfo]);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value ? parseInt(e.target.value) : undefined;
    onUpdate({ ...participantInfo, age });
  };

  const handleGenderChange = (gender: string) => {
    const genderValue = gender === 'prefer_not_to_say' ? undefined : gender;
    onUpdate({ ...participantInfo, gender: genderValue });
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const participantId = e.target.value || undefined;
    onUpdate({ ...participantInfo, participantId });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Participant Information</CardTitle>
        <p className="text-sm text-gray-600">
          Please provide some basic information. This data is optional and helps with research analysis.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={participantInfo.age || ''}
              onChange={handleAgeChange}
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender (Optional)</Label>
            <Select value={participantInfo.gender || 'prefer_not_to_say'} onValueChange={handleGenderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="participantId">Participant ID (Optional)</Label>
            <Input
              id="participantId"
              type="text"
              placeholder="Enter ID"
              value={participantInfo.participantId || ''}
              onChange={handleIdChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
