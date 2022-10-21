import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xvmxxtxqwplcqijqlupn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bXh4dHhxd3BsY3FpanFsdXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjYxODU3OTgsImV4cCI6MTk4MTc2MTc5OH0.MF1kLZNSGTdEkI__qtKhMg4SlElt74ryjOIWt-MQmO8'
const supabase = createClient(supabaseUrl, supabaseKey);

@Injectable()
export class SupabaseService {

  constructor() {
    console.log("Supabase Service Started")
    this.getStats();
  }

  async getStats() {
    const { data, error } = await supabase.from('yummle_stats').select();
    console.log(data, error);
  }


}